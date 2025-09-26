# 1. IMPORTS
import os
import datetime
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

from sentinelhub import (
    SHConfig,
    SentinelHubRequest,
    DataCollection,
    MimeType,
    bbox_to_dimensions,
    BBox
)

# 2. CONFIGURATION
# Load environment variables from .env file
load_dotenv()

# Supabase Client Initialization
URL: str = os.getenv("SUPABASE_URL")
KEY: str = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(URL, KEY)

# Sentinel Hub Client Initialization
config = SHConfig()
config.sh_client_id = os.getenv("SENTINEL_CLIENT_ID")
config.sh_client_secret = os.getenv("SENTINEL_CLIENT_SECRET")
config.sh_instance_id = os.getenv("SENTINEL_INSTANCE_ID")

print("Configuration Loaded.")


# 3. CORE PROCESSING FUNCTION (from Step 2)
def get_ndvi_for_project(coordinates: list, start_date: str, end_date: str):
    """
    Fetches and calculates the average NDVI for a given set of coordinates and date range.
    """
    try:
        # Define the bounding box from coordinates
        project_bbox = BBox(bbox=coordinates, crs='EPSG:4326')
        
        # Define the image size (resolution)
        project_size = bbox_to_dimensions(project_bbox, resolution=10) # 10m resolution

        # The evalscript tells Sentinel Hub how to calculate NDVI
        # (B08 = Near Infrared, B04 = Red)
        evalscript_ndvi = """
            //VERSION=3
            function setup() {
                return {
                    input: ["B04", "B08", "CLM"],
                    output: { bands: 1, sampleType: "FLOAT32" }
                };
            }
            function evaluatePixel(sample) {
                // Ignore cloudy pixels - CLM (cloud mask) > 0 means cloud
                if (sample.CLM > 0) {
                    return [null]; 
                }
                let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
                return [ndvi];
            }
        """

        # Create the request to Sentinel Hub API
        request = SentinelHubRequest(
            evalscript=evalscript_ndvi,
            input_data=[
                SentinelHubRequest.input_data(
                    data_collection=DataCollection.SENTINEL2_L2A,
                    time_interval=(start_date, end_date),
                )
            ],
            responses=[SentinelHubRequest.output_response("default", MimeType.TIFF)],
            bbox=project_bbox,
            size=project_size,
            config=config,
        )

        # Execute the request and get the data
        response_data = request.get_data()[0]
        
        # Calculate the mean NDVI, ignoring null/NaN values from clouds
        mean_ndvi = np.nanmean(response_data)

        print(f"Successfully processed data for bbox {coordinates}. Mean NDVI: {mean_ndvi:.4f}")
        return float(mean_ndvi)

    except Exception as e:
        print(f"An error occurred while processing coordinates {coordinates}: {e}")
        return None

def verify_solar_project(project_name, project_coords):
    """Placeholder function for verifying solar projects."""
    print(f"Executing SOLAR verification for '{project_name}'. Logic would run here (e.g., satellite object detection, grid data check).")
    # In the future, this function would return data to be inserted. For now, it does nothing.
    return None

def verify_landfill_gas_project(project_name, project_coords):
    """Placeholder function for verifying landfill gas projects."""
    print(f"Executing LANDFILL GAS verification for '{project_name}'. Logic would run here (e.g., methane satellite analysis).")
    return None

def calculate_v1_risk_score(project: dict, stability_data: pd.DataFrame) -> int:
    """
    Calculates a V1 risk score based on political stability from the official World Bank CSV.
    Lower score is better. Scale of 0-100.
    """
    score = 50  # Start with a baseline score
    
    try:
        project_country = project['location_text'].split(',')[-1].strip()
        
        # 1. Find the column for the most recent year that has data.
        # Get all columns that are years (e.g., '1960', '2022', etc.)
        year_columns = [col for col in stability_data.columns if col.isdigit()]
        latest_year_column = max(year_columns) # This will be e.g., "2024"

        # 2. Look up the country's data using the correct column name 'Country Name'
        country_row = stability_data[stability_data['Country Name'] == project_country]
        
        if not country_row.empty:
            # 3. Extract the score from the latest year's column
            stability_score_str = country_row.iloc[0][latest_year_column]
            
            # 4. Check if the score is a valid number (not empty)
            if stability_score_str and stability_score_str != "..":
                stability_score = float(stability_score_str)
                # Scale the score from -2.5 -> +2.5 to our risk modifier
                score -= (stability_score * 20)
                print(f"Applying stability modifier for {project_country}: {(-stability_score * 20):.1f}")
            else:
                print(f"No recent stability data available for {project_country}.")
        else:
            print(f"Country '{project_country}' not found in stability data.")

    except Exception as e:
        print(f"Could not parse country or stability score. Error: {e}")

    score = int(max(0, min(100, score))) # Ensure score is within bounds 0-100
    return score

# 4. MAIN ORCHESTRATION FUNCTION (from Step 3)
def run_pipeline():
    """
    Main pipeline function that now handles different project types.
    """
    print("--- Starting Pipeline Run ---")
    
    try:

        print("Loading political stability data...")
        stability_df = pd.read_csv('E:\carbon-pipeline\API_PV.EST_DS2_en_csv_v2_1023320\political_stability.csv', skiprows=4)

        # 1. Fetch all projects, now including their type
        response = supabase.table('projects').select('id, name, location_text, coordinates, type').execute()
        if not response.data:
            print("No projects found in the database.")
            return

        projects = response.data
        print(f"Found {len(projects)} projects to process.")
        
        # 2. Define the date range
        end_date = datetime.datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime('%Y-%m-%d')
        
        new_data_records = []

        # 3. Loop through each project and run the correct verification based on its type
        for project in projects:
            project_id = project['id']
            project_name = project['name']
            project_coords = project['coordinates']
            project_type = project['type']

            # calculate risk score for every project
            new_risk_score = calculate_v1_risk_score(project, stability_df)
            supabase.table('projects').update({'risk_score': new_risk_score}).eq('id', project['id']).execute()
            print(f"Updated risk score for '{project_name}' to {new_risk_score}")
            
            if not project_coords or not project_type:
                print(f"Skipping project '{project_name}' due to missing coordinates or type.")
                continue

            print(f"\nProcessing project: {project_name} (Type: {project_type})")
            
            # --- THIS IS THE NEW CONDITIONAL LOGIC ---
            if project_type == 'Reforestation':
                ndvi_value = get_ndvi_for_project(project_coords, start_date, end_date)
                if ndvi_value is not None:
                    record = { "project_id": project_id, "recorded_at": end_date, "ndvi_value": ndvi_value }
                    # We will adapt this to a more generic table later, for now this is fine.
                    new_data_records.append(record)
            
            elif project_type == 'Solar':
                verify_solar_project(project_name, project_coords)
            
            elif project_type == 'Landfill Gas':
                verify_landfill_gas_project(project_name, project_coords)
                
            else:
                print(f"No verification method defined for project type: {project_type}")

            

        # 4. Insert any new records found (currently only for NDVI)
        if new_data_records:
            print(f"\nInserting {len(new_data_records)} new NDVI records into the database...")
            # This logic will need to be updated when we have a generic data table
            insert_response = supabase.table('project_ndvi_data').insert(new_data_records).execute()
            
            if len(insert_response.data) > 0:
                print("Successfully inserted data.")
            else:
                 print(f"Failed to insert data. Response: {insert_response}")
        else:
            print("No new data to insert for this run.")
            
    except Exception as e:
        print(f"A critical error occurred in the pipeline: {e}")
        
    finally:
        print("--- Pipeline Run Finished ---")



        
# 5. SCRIPT EXECUTION BLOCK
if __name__ == "__main__":
    # This block ensures that the run_pipeline() function is only called
    # when you execute the script directly (e.g., `python main.py`).
    run_pipeline()