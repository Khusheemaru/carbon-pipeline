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
    Fetches historical NDVI data for Reforestation projects that haven't been filled yet.
    """
    print("--- Starting Historical Backfill ---")
    
    try:
        # --- UPDATED QUERY ---
        # 1. Fetch Reforestation projects where historical_data_filled is false (or null).
        response = supabase.table('projects').select('id, name, coordinates').eq('type', 'Reforestation').filter('historical_data_filled', 'is', 'false').execute()
        
        if not response.data:
            print("No new Reforestation projects to backfill.")
            return

        projects = response.data
        print(f"Found {len(projects)} new Reforestation projects to backfill.")

        # 2. Loop through each new project
        for project in projects:
            project_id = project['id']
            project_name = project['name']
            project_coords = project['coordinates']
            
            if not project_coords:
                print(f"Skipping '{project_name}' due to missing coordinates.")
                continue

            print(f"\nBackfilling data for: {project_name}")
            all_new_records = []
            
            # 3. Loop backwards in time, month by month, for the last 24 months
            current_date = datetime.date.today()
            for i in range(24):
                start_of_month = current_date.replace(day=1)
                end_of_month = (start_of_month + relativedelta(months=1)) - datetime.timedelta(days=1)
                
                start_date_str = start_of_month.strftime('%Y-%m-%d')
                end_date_str = end_of_month.strftime('%Y-%m-%d')
                
                print(f"Fetching data for period: {start_date_str} to {end_date_str}")
                
                # 4. Call our existing NDVI function
                ndvi_value = get_ndvi_for_project(project_coords, start_date_str, end_date_str)
                
                if ndvi_value is not None:
                    record = { "project_id": project_id, "recorded_at": end_date_str, "ndvi_value": ndvi_value }
                    all_new_records.append(record)
                
                current_date = current_date - relativedelta(months=1)

            # 5. Insert all historical records for this specific project
            if all_new_records:
                print(f"\nInserting {len(all_new_records)} records for '{project_name}'...")
                insert_response = supabase.table('project_ndvi_data').insert(all_new_records).execute()
                
                if insert_response.data:
                    print(f"Successfully inserted data for '{project_name}'.")
                    # --- NEW: Update the project's status flag to true ---
                    print(f"Marking '{project_name}' as complete.")
                    supabase.table('projects').update({'historical_data_filled': True}).eq('id', project_id).execute()
                else:
                    print(f"Failed to insert data for '{project_name}'. Response: {insert_response}")
            else:
                print(f"No new historical data was generated for '{project_name}'.")
            
    except Exception as e:
        print(f"A critical error occurred: {e}")
        
    finally:
        print("--- Historical Backfill Finished ---")

# --- Entry point of the script ---
if __name__ == "__main__":
    run_backfill()