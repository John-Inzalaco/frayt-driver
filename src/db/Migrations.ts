let migrations = {
  202105040507: 'DROP TABLE IF EXISTS Matches;',
  202105040508:
    'CREATE TABLE IF NOT EXISTS Matches (id TEXT,state TEXT,bill_of_lading_photo TEXT, cancelation_reason TEXT,created_at INTEGER,accepted_at INTEGER,delivered_at INTEGER,arrived_at_dropoff_at INTEGER,arrived_at_pickup_at INTEGER,picked_up_at INTEGER,destination_address TEXT,items TEXT,delivery_notes TEXT,distance NUMERIC,driver_id TEXT,driver_email TEXT,po TEXT,shortcode TEXT,origin_address TEXT,description TEXT,height NUMERIC,length NUMERIC,width NUMERIC,origin_photo NUMERIC,origin_photo_required BOOLEAN,destination_photo NUMERIC,destination_photo_required BOOLEAN,receiver_signature_photo NUMERIC,pieces NUMERIC,total_weight NUMERIC,total_volume NUMERIC,weight NUMERIC,pickup_notes TEXT,rating NUMERIC,receiver_name TEXT,receiver_signature TEXT,recipient_name TEXT,recipient_phone TEXT,dropoff_at INTEGER,pickup_at INTEGER,has_load_fee INTEGER,driver_tip NUMERIC,driver_base_price NUMERIC,driver_load_fee_price NUMERIC,toll_fee_price NUMERIC,driver_total_pay NUMERIC,vehicle_class TEXT,vehicle_class_id TEXT,service_level INTEGER,shipper_name TEXT, shipper_phone TEXT, recipient_email TEXT, shipper JSON, completed_at INTEGER, stops JSON, sla_rating INTEGER, fulfillment_rating INTEGER, activity_rating INTEGER, bill_of_lading_required BOOLEAN);',
};

let orderedMigrations = {};

Object.keys(migrations)
  .sort()
  .forEach(function (key) {
    orderedMigrations[key] = migrations[key];
  });

export default orderedMigrations;

export type DBFieldType = 'number' | 'string' | 'boolean' | 'date' | 'json';
