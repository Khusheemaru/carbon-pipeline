# 1. IMPORTS
import os
import datetime
import numpy as np
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



# 4. MAIN ORCHESTRATION FUNCTION (from Step 3)
def run_pipeline():
    """
    Main pipeline function that now handles different project types.
    """
    print("--- Starting Pipeline Run ---")
    
    try:
        # 1. Fetch all projects, now including their type
        response = supabase.table('projects').select('id, name, coordinates, type').execute()
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