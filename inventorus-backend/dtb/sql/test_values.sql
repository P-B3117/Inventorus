-- Insert test data for 'types'
INSERT INTO Types (name, description, unit) VALUES
('Resistor', 'Passive component used to limit current flow', 'Ω'),
('Capacitor', 'Passive component used to store electrical charge', 'F'),
('Inductor', 'Passive component used to store energy in a magnetic field', 'H'),
('Diode', 'Component that allows current to flow in one direction', 'A'),
('Transistor', 'Active component used for switching and amplification', 'W');

-- Insert test data for 'vendors'
INSERT INTO Vendors (url, description, name) VALUES
('https://www.digikey.com', 'Electronics components distributor', 'DigiKey'),
('https://www.mouser.com', 'Global distributor of semiconductors and components', 'Mouser'),
('https://www.arrow.com', 'Electronic components and enterprise computing', 'Arrow Electronics'),
('https://www.tme.eu', 'European electronic components supplier', 'TME'),
('https://www.sparkfun.com', 'Hobbyist electronics and prototyping parts', 'SparkFun');

-- Insert test data for 'components'
INSERT INTO Components (type_id, value, quantity, footprint, vendor_id, description, vendor_part_number, price) VALUES
(1, '10', 500, '0805', 1, 'Surface mount resistor 10kΩ ±1%', 'RC0805FR-0710KL', 2),
(2, '100', 1000, '0603', 2, 'Ceramic capacitor 100nF 50V X7R', 'C0603X7R500-104K', 5),
(3, '10', 200, 'SMD 1210', 3, 'Shielded power inductor 10µH ±20%', 'SD1210-100K', 30),
(4, '1N4148', 750, 'DO-35', 4, 'Small signal switching diode', '1N4148-T', 1),
(5, '2N3904', 300, 'TO-92', 5, 'NPN general purpose transistor', '2N3904BU', 4);
