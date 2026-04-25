-- ============================================================
-- AaoCab Autonomous Operations Migration
-- Adds driver availability, booking status audit log, and notification log
-- ============================================================

-- Driver availability: tracks which drivers are available on which dates
CREATE TABLE IF NOT EXISTS driver_availability (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id),
  available_date date NOT NULL,
  start_time time NOT NULL DEFAULT '06:00',
  end_time time NOT NULL DEFAULT '23:00',
  operating_city_id uuid REFERENCES cities(id),
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(driver_id, available_date)
);

-- Booking status audit log: records every status change for a booking
CREATE TABLE IF NOT EXISTS booking_status_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by text DEFAULT 'system',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Notification log: records every notification sent (WhatsApp, SMS, email)
CREATE TABLE IF NOT EXISTS notification_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES bookings(id),
  recipient_phone text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email')),
  template_name text NOT NULL,
  message_body text,
  status text DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'failed')),
  external_message_id text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_driver_availability_date ON driver_availability(available_date, is_available);
CREATE INDEX IF NOT EXISTS idx_driver_availability_city ON driver_availability(operating_city_id);
CREATE INDEX IF NOT EXISTS idx_booking_status_log_booking ON booking_status_log(booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_booking ON notification_log(booking_id);
