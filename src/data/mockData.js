// ============================================================
// MOCK DATA — Replace service layer with google.script.run calls
// ============================================================

export const PROGRAMS = ['ANA', 'Elevate'];

export const STATUSES = [
  'Pending', 'Contacted', 'RNR', 'Busy',
  'Connect Later', 'Retail Issue', 'Not Interested', 'Onboarded'
];

export const USERS = [
  { user_id: 'u1', name: 'Rahul Tiwari', email: 'rahul@sellergeni.com', role: 'Admin', program_access: 'Both', is_active: true, created_at: '2024-01-15' },
  { user_id: 'u2', name: 'Amit Sharma', email: 'amit@sellergeni.com', role: 'Executive', program_access: 'ANA', is_active: true, created_at: '2024-02-01' },
  { user_id: 'u3', name: 'Neha Verma', email: 'neha@sellergeni.com', role: 'Executive', program_access: 'Both', is_active: true, created_at: '2024-02-10' },
  { user_id: 'u4', name: 'Priya Nair', email: 'priya@sellergeni.com', role: 'Executive', program_access: 'Elevate', is_active: true, created_at: '2024-03-01' },
  { user_id: 'u5', name: 'Karan Singh', email: 'karan@sellergeni.com', role: 'Executive', program_access: 'ANA', is_active: false, created_at: '2024-01-20' },
];

const generateLeads = () => {
  const sellers = [
    { name: 'Bharat Electronics', city: 'Mumbai' },
    { name: 'ShopEasy Traders', city: 'Delhi' },
    { name: 'GreenLeaf Organics', city: 'Bangalore' },
    { name: 'Sunrise Fashions', city: 'Hyderabad' },
    { name: 'TechZone Retail', city: 'Chennai' },
    { name: 'Maa Durga Enterprises', city: 'Kolkata' },
    { name: 'Himalayan Crafts', city: 'Jaipur' },
    { name: 'Delta Sports Goods', city: 'Pune' },
    { name: 'StarBright Cosmetics', city: 'Ahmedabad' },
    { name: 'Royal Furniture Works', city: 'Surat' },
    { name: 'KitchenKing Appliances', city: 'Lucknow' },
    { name: 'Eco Bags India', city: 'Nagpur' },
    { name: 'Pinewood Books', city: 'Bhopal' },
    { name: 'SwiftStyle Garments', city: 'Indore' },
    { name: 'Oceanic Seafood Co.', city: 'Kochi' },
    { name: 'GoldMine Jewellers', city: 'Coimbatore' },
    { name: 'Alpine Spices', city: 'Mysore' },
    { name: 'BlueStar Auto Parts', city: 'Chandigarh' },
    { name: 'Urban Home Decor', city: 'Noida' },
    { name: 'Radha Toys & Games', city: 'Gurugram' },
    { name: 'Premier Pet Supplies', city: 'Visakhapatnam' },
    { name: 'Desi Health Foods', city: 'Patna' },
    { name: 'InnovateTech Tools', city: 'Vadodara' },
    { name: 'Classic Stationery', city: 'Agra' },
    { name: 'FreshGarden Nursery', city: 'Ranchi' },
    { name: 'Majestic Textiles', city: 'Tirupur' },
    { name: 'QuickFix Hardware', city: 'Ludhiana' },
    { name: 'Sunbeam Solar', city: 'Jamshedpur' },
    { name: 'Heritage Handicrafts', city: 'Jodhpur' },
    { name: 'ZenFit Sportswear', city: 'Bhubaneswar' },
  ];

  const executives = ['u1', 'u2', 'u3', 'u4'];
  const execNames = { u1: 'Rahul Tiwari', u2: 'Amit Sharma', u3: 'Neha Verma', u4: 'Priya Nair' };
  const programs = ['ANA', 'ANA', 'ANA', 'Elevate', 'Elevate'];
  const statuses = ['Pending', 'Contacted', 'RNR', 'Busy', 'Connect Later', 'Retail Issue', 'Not Interested', 'Onboarded'];
  const weights = [3, 4, 3, 2, 2, 1, 1, 2]; // weighted distribution

  const pickWeighted = (arr, w) => {
    const total = w.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < arr.length; i++) {
      r -= w[i];
      if (r <= 0) return arr[i];
    }
    return arr[arr.length - 1];
  };

  const randomDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
    return d.toISOString().split('T')[0];
  };

  const futureDate = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + Math.floor(Math.random() * daysAhead));
    return d.toISOString().split('T')[0];
  };

  return sellers.map((s, i) => {
    const exec = executives[i % executives.length];
    const status = pickWeighted(statuses, weights);
    const attempts = Math.floor(Math.random() * 6) + 1;
    const program = programs[i % programs.length];
    const hasCallback = ['Connect Later', 'Busy', 'RNR'].includes(status);
    const mid = 100200 + i;

    return {
      lead_id: `l${i + 1}`,
      program,
      seller_name: s.name,
      mid: String(mid),
      email: `seller${mid}@example.com`,
      phone: `+91 ${9800000000 + mid}`,
      city: s.city,
      assigned_to: exec,
      assigned_to_name: execNames[exec],
      seller_status: status,
      ds_am_status: status === 'Onboarded' ? 'Active' : 'Pending',
      attempts,
      callback_date: hasCallback ? (Math.random() > 0.5 ? new Date().toISOString().split('T')[0] : futureDate(3)) : null,
      callback_time: hasCallback ? `${2 + Math.floor(Math.random() * 6)}:${Math.random() > 0.5 ? '00' : '30'} PM` : null,
      last_contacted_at: status !== 'Pending' ? randomDate(10) : null,
      onboarding_date: status === 'Onboarded' ? randomDate(30) : null,
      lead_type: program === 'ANA' ? 'New Advertiser' : 'Existing Advertiser',
      wallet_recharge: status === 'Onboarded' ? Math.floor(Math.random() * 50000) + 5000 : 0,
      free_credit: status === 'Onboarded' ? Math.floor(Math.random() * 10000) + 1000 : 0,
      case_number: `CASE-${mid}-${2024}`,
      request_id: `REQ${mid}${i}`,
      spn_status: status === 'Onboarded' ? 'Enrolled' : 'Pending',
      notes: status !== 'Pending' ? 'Spoke with owner. Interested but needs more time to decide.' : '',
      created_at: randomDate(60),
      updated_at: randomDate(5),
    };
  });
};

export let leads = generateLeads();

export const callLogs = [
  { call_log_id: 'cl1', lead_id: 'l1', call_time: '2024-08-26T10:42:00', status: 'Contacted', executive: 'Rahul Tiwari', notes: 'Owner was available. Discussed benefits.' },
  { call_log_id: 'cl2', lead_id: 'l2', call_time: '2024-08-26T10:35:00', status: 'RNR', executive: 'Amit Sharma', notes: 'No response after 3 rings.' },
  { call_log_id: 'cl3', lead_id: 'l3', call_time: '2024-08-26T09:50:00', status: 'Busy', executive: 'Neha Verma', notes: 'Phone busy. Will retry.' },
  { call_log_id: 'cl4', lead_id: 'l4', call_time: '2024-08-25T14:20:00', status: 'Connect Later', executive: 'Rahul Tiwari', notes: 'Asked to call back tomorrow at 3 PM.' },
  { call_log_id: 'cl5', lead_id: 'l5', call_time: '2024-08-25T11:10:00', status: 'Onboarded', executive: 'Priya Nair', notes: 'Completed onboarding. Seller is live.' },
  { call_log_id: 'cl6', lead_id: 'l6', call_time: '2024-08-24T16:00:00', status: 'Not Interested', executive: 'Amit Sharma', notes: 'Seller not interested. Using another platform.' },
  { call_log_id: 'cl7', lead_id: 'l7', call_time: '2024-08-24T13:30:00', status: 'Contacted', executive: 'Neha Verma', notes: 'Positive response. Sending follow-up email.' },
  { call_log_id: 'cl8', lead_id: 'l8', call_time: '2024-08-23T10:00:00', status: 'Retail Issue', executive: 'Rahul Tiwari', notes: 'Seller has retail store issue blocking onboarding.' },
  { call_log_id: 'cl9', lead_id: 'l1', call_time: '2024-08-23T09:20:00', status: 'Pending', executive: 'Rahul Tiwari', notes: 'Initial contact attempt.' },
  { call_log_id: 'cl10', lead_id: 'l9', call_time: '2024-08-22T15:45:00', status: 'Connect Later', executive: 'Priya Nair', notes: 'Scheduled callback for next week.' },
  { call_log_id: 'cl11', lead_id: 'l10', call_time: '2024-08-22T12:00:00', status: 'Contacted', executive: 'Amit Sharma', notes: 'Discussed program benefits.' },
  { call_log_id: 'cl12', lead_id: 'l11', call_time: '2024-08-21T11:30:00', status: 'RNR', executive: 'Neha Verma', notes: 'No answer.' },
  { call_log_id: 'cl13', lead_id: 'l12', call_time: '2024-08-21T10:15:00', status: 'Onboarded', executive: 'Rahul Tiwari', notes: 'Successfully onboarded.' },
  { call_log_id: 'cl14', lead_id: 'l13', call_time: '2024-08-20T14:00:00', status: 'Busy', executive: 'Amit Sharma', notes: 'Line busy.' },
  { call_log_id: 'cl15', lead_id: 'l14', call_time: '2024-08-20T09:00:00', status: 'Contacted', executive: 'Neha Verma', notes: 'Owner interested. Will review docs.' },
  { call_log_id: 'cl16', lead_id: 'l15', call_time: '2024-08-19T16:30:00', status: 'Connect Later', executive: 'Priya Nair', notes: 'Ask to call back after festival.' },
  { call_log_id: 'cl17', lead_id: 'l16', call_time: '2024-08-19T11:00:00', status: 'Contacted', executive: 'Rahul Tiwari', notes: 'Good conversation.' },
  { call_log_id: 'cl18', lead_id: 'l17', call_time: '2024-08-18T15:00:00', status: 'Retail Issue', executive: 'Amit Sharma', notes: 'GST mismatch issue found.' },
  { call_log_id: 'cl19', lead_id: 'l18', call_time: '2024-08-18T10:30:00', status: 'RNR', executive: 'Neha Verma', notes: 'No response.' },
  { call_log_id: 'cl20', lead_id: 'l19', call_time: '2024-08-17T13:00:00', status: 'Onboarded', executive: 'Priya Nair', notes: 'Seller completed all steps.' },
];

export const emailLogs = [
  { email_log_id: 'el1', lead_id: 'l5', timestamp: '2024-08-25T10:00:00', email_type: 'Onboarding Email', to_email: 'seller100205@example.com', subject: 'Welcome to Amazon Advertising - Next Steps', sent_by: 'Priya Nair', status: 'Delivered' },
  { email_log_id: 'el2', lead_id: 'l7', timestamp: '2024-08-24T14:30:00', email_type: 'Follow-up Email', to_email: 'seller100207@example.com', subject: 'Following up on our conversation', sent_by: 'Neha Verma', status: 'Delivered' },
  { email_log_id: 'el3', lead_id: 'l12', timestamp: '2024-08-21T09:00:00', email_type: 'Onboarding Email', to_email: 'seller100212@example.com', subject: 'Welcome to Amazon Advertising - Next Steps', sent_by: 'Rahul Tiwari', status: 'Delivered' },
  { email_log_id: 'el4', lead_id: 'l1', timestamp: '2024-08-26T11:00:00', email_type: 'Introduction Email', to_email: 'seller100201@example.com', subject: 'Grow your business with Amazon Ads', sent_by: 'Rahul Tiwari', status: 'Delivered' },
  { email_log_id: 'el5', lead_id: 'l3', timestamp: '2024-08-26T10:00:00', email_type: 'Follow-up Email', to_email: 'seller100203@example.com', subject: 'Following up - Amazon Ads opportunity', sent_by: 'Neha Verma', status: 'Bounced' },
];

export const auditLogs = [
  { timestamp: '2024-08-26T10:42:00', user: 'Rahul Tiwari', lead_id: 'l1', action: 'Status Changed', field: 'seller_status', old_value: 'Pending', new_value: 'Contacted' },
  { timestamp: '2024-08-26T10:35:00', user: 'Amit Sharma', lead_id: 'l2', action: 'Call Logged', field: 'attempts', old_value: '1', new_value: '2' },
  { timestamp: '2024-08-26T10:21:00', user: 'Rahul Tiwari', lead_id: 'l15', action: 'Lead Assigned', field: 'assigned_to', old_value: 'Unassigned', new_value: 'Neha Verma' },
  { timestamp: '2024-08-26T09:50:00', user: 'Neha Verma', lead_id: 'l3', action: 'Status Changed', field: 'seller_status', old_value: 'Contacted', new_value: 'Busy' },
  { timestamp: '2024-08-25T16:00:00', user: 'Priya Nair', lead_id: 'l5', action: 'Lead Updated', field: 'onboarding_date', old_value: '', new_value: '2024-08-25' },
  { timestamp: '2024-08-25T14:20:00', user: 'Rahul Tiwari', lead_id: 'l4', action: 'Callback Updated', field: 'callback_date', old_value: '', new_value: '2024-08-26' },
  { timestamp: '2024-08-25T12:00:00', user: 'System', lead_id: null, action: 'Import Completed', field: null, old_value: null, new_value: '15 leads imported' },
  { timestamp: '2024-08-25T11:10:00', user: 'Priya Nair', lead_id: 'l5', action: 'Status Changed', field: 'seller_status', old_value: 'Contacted', new_value: 'Onboarded' },
  { timestamp: '2024-08-24T16:00:00', user: 'Amit Sharma', lead_id: 'l6', action: 'Status Changed', field: 'seller_status', old_value: 'Contacted', new_value: 'Not Interested' },
  { timestamp: '2024-08-24T14:30:00', user: 'Neha Verma', lead_id: 'l7', action: 'Email Sent', field: null, old_value: null, new_value: 'Follow-up Email sent' },
  { timestamp: '2024-08-24T13:30:00', user: 'Neha Verma', lead_id: 'l7', action: 'Status Changed', field: 'seller_status', old_value: 'Pending', new_value: 'Contacted' },
  { timestamp: '2024-08-23T10:00:00', user: 'Rahul Tiwari', lead_id: 'l8', action: 'Status Changed', field: 'seller_status', old_value: 'Contacted', new_value: 'Retail Issue' },
  { timestamp: '2024-08-22T15:45:00', user: 'Priya Nair', lead_id: 'l9', action: 'Callback Updated', field: 'callback_date', old_value: '2024-08-22', new_value: '2024-08-28' },
  { timestamp: '2024-08-22T09:00:00', user: 'Rahul Tiwari', lead_id: null, action: 'Lead Created', field: null, old_value: null, new_value: 'Batch of 30 leads created' },
  { timestamp: '2024-08-21T11:30:00', user: 'System', lead_id: 'l12', action: 'Email Sent', field: null, old_value: null, new_value: 'Onboarding Email sent' },
];

export const activityFeed = [
  { time: '10:42 AM', user: 'Rahul', action: 'Status Updated', lead: 'Bharat Electronics', details: 'Pending → Contacted' },
  { time: '10:35 AM', user: 'Amit', action: 'Call Logged', lead: 'ShopEasy Traders', details: 'RNR — 2nd attempt' },
  { time: '10:21 AM', user: 'Rahul', action: 'Lead Assigned', lead: 'FreshGarden Nursery', details: 'Assigned to Neha' },
  { time: '09:50 AM', user: 'Neha', action: 'Status Updated', lead: 'GreenLeaf Organics', details: 'Contacted → Busy' },
  { time: '09:30 AM', user: 'Priya', action: 'Onboarded', lead: 'ZenFit Sportswear', details: 'Completed onboarding' },
  { time: 'Yesterday', user: 'Amit', action: 'Email Sent', lead: 'Delta Sports Goods', details: 'Follow-up email sent' },
  { time: 'Yesterday', user: 'Neha', action: 'Callback Scheduled', lead: 'Sunrise Fashions', details: 'Aug 26, 4:00 PM' },
  { time: 'Yesterday', user: 'Rahul', action: 'Import Completed', lead: '—', details: '15 new leads imported' },
];
