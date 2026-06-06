import { db } from './db.js';

const SKILLS = [
  'Welder',
  'Electrician',
  'Plumber',
  'Mason',
  'Carpenter',
  'Driver',
  'Helper',
  'Steel Fixer',
  'Pipe Fitter',
  'HVAC Technician',
  'Painter',
  'Fabricator',
  'Machine Operator',
  'Construction Worker',
] as const;

const STATE_DISTRICTS: Record<string, string[]> = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore'],
  'Arunachal Pradesh': ['Itanagar', 'Tawang', 'Pasighat', 'Ziro'],
  Assam: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Tezpur'],
  Bihar: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'],
  Chhattisgarh: ['Raipur', 'Bhilai', 'Bilaspur', 'Durg', 'Korba'],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  Haryana: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'],
  Kerala: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  Manipur: ['Imphal', 'Thoubal', 'Bishnupur'],
  Meghalaya: ['Shillong', 'Tura', 'Jowai'],
  Mizoram: ['Aizawl', 'Lunglei', 'Champhai'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur', 'Puri'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Mohali'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  Sikkim: ['Gangtok', 'Namchi', 'Gyalshing'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  Tripura: ['Agartala', 'Dharmanagar', 'Udaipur'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad', 'Varanasi', 'Agra'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
  Delhi: ['Central Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'North Delhi'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla'],
  Ladakh: ['Leh', 'Kargil'],
  Puducherry: ['Puducherry', 'Karaikal', 'Mahe'],
  Chandigarh: ['Chandigarh'],
};

export function seedDatabase(): void {
  const insertState = db.prepare('INSERT OR IGNORE INTO states (name) VALUES (?)');
  const insertDistrict = db.prepare(
    'INSERT OR IGNORE INTO districts (state_id, name) VALUES (?, ?)'
  );
  const insertSkill = db.prepare('INSERT OR IGNORE INTO skills (name) VALUES (?)');

  const seedAll = db.transaction(() => {
    for (const skill of SKILLS) {
      insertSkill.run(skill);
    }

    for (const [stateName, districts] of Object.entries(STATE_DISTRICTS)) {
      insertState.run(stateName);
      const state = db
        .prepare('SELECT id FROM states WHERE name = ?')
        .get(stateName) as { id: number };
      for (const district of districts) {
        insertDistrict.run(state.id, district);
      }
    }
  });

  seedAll();
  console.log('Database seeded with states, districts, and skills.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}
