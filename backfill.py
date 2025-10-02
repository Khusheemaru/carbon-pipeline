import os
import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from dateutil.relativedelta import relativedelta
from main import get_ndvi_for_project # We reuse our robust, cloud-filtering function

# --- Configuration ---
load_dotenv()
URL: str = os.getenv("SUPABASE_URL")
KEY: str = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(URL, KEY)

print("Configuration Loaded.")

def run_backfill():
    """
    Fetches historical NDVI data for all Reforestation projects for the past 24 months.
    """
    print("--- Starting Historical Backfill ---")
    
    try:
        # 1. Fetch only Reforestation projects from Supabase
        response = supabase.table('projects').select('id, name, coordinates').eq('type', 'Reforestation').execute()
        if not response.data:
            print("No Reforestation projects found.")
            return

        projects = response.data
        print(f"Found {len(projects)} Reforestation projects to backfill.")

        all_new_records = []

        # 2. Loop through each project
        for project in projects:
            project_id = project['id']
            project_name = project['name']
            project_coords = project['coordinates']
            
            if not project_coords:
                print(f"Skipping '{project_name}' due to missing coordinates.")
                continue

            print(f"\nBackfilling data for: {project_name}")

            # --- CORRECTED DATE LOOP ---
            # 3. Loop backwards in time, month by month, for the last 24 months
            current_date = datetime.date.today()
            for i in range(24):
                # Set the time interval for the current month in the loop
                start_of_month = current_date.replace(day=1)
                # To get the end of the month, we go to the first day of the *next* month and subtract one day
                end_of_month = (start_of_month + relativedelta(months=1)) - datetime.timedelta(days=1)
                
                start_date_str = start_of_month.strftime('%Y-%m-%d')
                end_date_str = end_of_month.strftime('%Y-%m-%d')
                
                print(f"Fetching data for period: {start_date_str} to {end_date_str}")
                
                # 4. Call our existing NDVI function for that historical period
                ndvi_value = get_ndvi_for_project(project_coords, start_date_str, end_date_str)
                
                if ndvi_value is not None:
                    record = {
                        "project_id": project_id,
                        "recorded_at": end_date_str, # Save the data point at the end of the month
                        "ndvi_value": ndvi_value
                    }
                    all_new_records.append(record)
                
                # Move to the previous month for the next loop iteration
                current_date = current_date - relativedelta(months=1)

        # 5. Insert all the historical records into Supabase at once
        if all_new_records:
            print(f"\nInserting {len(all_new_records)} new historical records into the database...")
            # Supabase python client has a limit of around 1500 rows per insert.
            # We will chunk the data if we have too many records.
            chunk_size = 1000
            for i in range(0, len(all_new_records), chunk_size):
                chunk = all_new_records[i:i + chunk_size]
                insert_response = supabase.table('project_ndvi_data').insert(chunk).execute()
                if insert_response.data:
                    print(f"Successfully inserted chunk {i // chunk_size + 1}.")
                else:
                    print(f"Failed to insert chunk. Response: {insert_response}")
        else:
            print("No new historical data was generated.")
            
    except Exception as e:
        print(f"A critical error occurred: {e}")
        
    finally:
        print("--- Historical Backfill Finished ---")

# --- Entry point of the script ---
if __name__ == "__main__":
    # You will need to pip install python-dateutil for this script to work
    run_backfill()