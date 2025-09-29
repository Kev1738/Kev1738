-- Create RPC functions for database testing and management

-- Function to get all table names
CREATE OR REPLACE FUNCTION get_table_names()
RETURNS TABLE(table_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT t.table_name::text
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
  ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get database statistics
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS json AS $$
DECLARE
  result json;
  users_count integer;
  drivers_count integer;
  rides_count integer;
  tables_count integer;
BEGIN
  -- Get counts from each table
  SELECT COUNT(*) INTO users_count FROM users;
  SELECT COUNT(*) INTO drivers_count FROM drivers;
  SELECT COUNT(*) INTO rides_count FROM rides;
  
  -- Get table count
  SELECT COUNT(*) INTO tables_count 
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  
  -- Build result JSON
  result := json_build_object(
    'users_count', users_count,
    'drivers_count', drivers_count,
    'rides_count', rides_count,
    'tables_count', tables_count,
    'last_updated', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to test database health
CREATE OR REPLACE FUNCTION test_database_health()
RETURNS json AS $$
DECLARE
  result json;
  table_exists boolean;
  connection_ok boolean := true;
BEGIN
  -- Test if main tables exist
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    connection_ok := false;
  END IF;
  
  -- Build health check result
  result := json_build_object(
    'status', CASE WHEN connection_ok THEN 'healthy' ELSE 'unhealthy' END,
    'tables_exist', table_exists,
    'timestamp', NOW(),
    'database_version', version()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to execute dynamic queries (for testing purposes)
CREATE OR REPLACE FUNCTION execute_query(query_text text, query_params text[] DEFAULT '{}')
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- This is a simplified version - in production, you'd want more security
  -- For now, we'll just return a success message
  result := json_build_object(
    'status', 'executed',
    'query', query_text,
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get ride statistics
CREATE OR REPLACE FUNCTION get_ride_stats()
RETURNS json AS $$
DECLARE
  result json;
  total_rides integer;
  completed_rides integer;
  pending_rides integer;
  cancelled_rides integer;
BEGIN
  SELECT COUNT(*) INTO total_rides FROM rides;
  SELECT COUNT(*) INTO completed_rides FROM rides WHERE status = 'completed';
  SELECT COUNT(*) INTO pending_rides FROM rides WHERE status = 'pending';
  SELECT COUNT(*) INTO cancelled_rides FROM rides WHERE status = 'cancelled';
  
  result := json_build_object(
    'total_rides', total_rides,
    'completed_rides', completed_rides,
    'pending_rides', pending_rides,
    'cancelled_rides', cancelled_rides,
    'completion_rate', 
      CASE 
        WHEN total_rides > 0 THEN ROUND((completed_rides::decimal / total_rides::decimal) * 100, 2)
        ELSE 0 
      END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get driver statistics
CREATE OR REPLACE FUNCTION get_driver_stats()
RETURNS json AS $$
DECLARE
  result json;
  total_drivers integer;
  available_drivers integer;
  active_drivers integer;
BEGIN
  SELECT COUNT(*) INTO total_drivers FROM drivers;
  SELECT COUNT(*) INTO available_drivers FROM drivers WHERE is_available = true;
  SELECT COUNT(*) INTO active_drivers 
  FROM drivers d 
  JOIN rides r ON d.user_id = r.driver_id 
  WHERE r.status IN ('accepted', 'in_progress');
  
  result := json_build_object(
    'total_drivers', total_drivers,
    'available_drivers', available_drivers,
    'active_drivers', active_drivers,
    'availability_rate',
      CASE 
        WHEN total_drivers > 0 THEN ROUND((available_drivers::decimal / total_drivers::decimal) * 100, 2)
        ELSE 0 
      END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_table_names() TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION test_database_health() TO authenticated;
GRANT EXECUTE ON FUNCTION execute_query(text, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ride_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_driver_stats() TO authenticated;

-- Grant execute permissions to anonymous users for basic functions
GRANT EXECUTE ON FUNCTION get_table_names() TO anon;
GRANT EXECUTE ON FUNCTION test_database_health() TO anon;
