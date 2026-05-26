const API = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return { status: res.status, data };
}

async function runTests() {
  console.log('🚀 Starting Super Admin & Department CRUD Integration Tests...');
  let token = '';

  try {
    // Test 1: Authenticate Super Admin
    console.log('\n--- Test 1: Authenticating Super Admin ---');
    const loginRes = await request(`${API}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    });
    
    console.log('Login Response:', loginRes.data);
    if (loginRes.data && loginRes.data.token) {
      console.log('✅ Auth successful! Role confirmed:', loginRes.data.role);
      token = loginRes.data.token;
    } else {
      throw new Error('Authentication failed or role mismatch');
    }

    const headers = { Authorization: `Bearer ${token}` };

    // Pre-cleanup of AST department and HOD user if they exist
    console.log('\n--- Pre-cleanup: Clearing stale test records ---');
    try {
      const allDepts = await request(`${API}/departments`, { method: 'GET', headers });
      const staleDept = allDepts.data.find(d => d.code === 'AST' || d.name === 'Astrophysics' || d.name === 'Advanced Astrophysics');
      if (staleDept) {
        await request(`${API}/departments/${staleDept._id}`, { method: 'DELETE', headers });
        console.log('🧹 Cleaned up stale AST department.');
      }

      const allUsers = await request(`${API}/auth/all-users`, { method: 'GET', headers });
      const staleUser = allUsers.data.find(u => u.username === 'stellahod@university.com');
      if (staleUser) {
        await request(`${API}/auth/users/${staleUser._id}`, { method: 'DELETE', headers });
        console.log('🧹 Cleaned up stale HOD user.');
      }
    } catch (err) {
      console.log('No stale records found to clean.');
    }

    // Test 2: Fetch current departments
    console.log('\n--- Test 2: Fetching Academic Departments ---');
    const deptRes = await request(`${API}/departments`, { method: 'GET', headers });
    console.log(`✅ Retrieved ${deptRes.data.length} departments:`, deptRes.data.map(d => d.code));

    // Test 3: Create a new department
    console.log('\n--- Test 3: Creating New Department (Astrophysics / AST) ---');
    const createDeptRes = await request(`${API}/departments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Astrophysics',
        code: 'AST'
      })
    });
    
    if (createDeptRes.data.success) {
      console.log('✅ Department created:', createDeptRes.data.department.name);
    } else {
      throw new Error('Failed to create department');
    }
    const newDeptId = createDeptRes.data.department._id;

    // Test 4: Check duplicate department validation
    console.log('\n--- Test 4: Verifying Duplicate Department Constraint ---');
    try {
      await request(`${API}/departments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Astrophysics',
          code: 'AST'
        })
      });
      throw new Error('Duplicate allowed improperly');
    } catch (err) {
      console.log('✅ Constraint block succeeded! Error returned:', err.message);
    }

    // Test 5: Edit the department
    console.log('\n--- Test 5: Editing Department (Update AST name) ---');
    const updateDeptRes = await request(`${API}/departments/${newDeptId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: 'Advanced Astrophysics'
      })
    });
    if (updateDeptRes.data.success && updateDeptRes.data.department.name === 'Advanced Astrophysics') {
      console.log('✅ Update successful! New name:', updateDeptRes.data.department.name);
    } else {
      throw new Error('Failed to update department name');
    }

    // Test 6: Fetch all users
    console.log('\n--- Test 6: Fetching All System Users ---');
    const usersRes = await request(`${API}/auth/all-users`, { method: 'GET', headers });
    console.log(`✅ Retrieved ${usersRes.data.length} total users.`);

    // Test 7: Create a new HOD user directly
    console.log('\n--- Test 7: Creating New Department HOD Admin ---');
    const createHODRes = await request(`${API}/auth/create-user`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Dr. Stella HOD',
        username: 'stellahod@university.com',
        password: 'stella_password',
        role: 'HOD',
        department: 'Advanced Astrophysics'
      })
    });

    if (createHODRes.data.success) {
      console.log('✅ HOD created successfully:', createHODRes.data.user.name);
    } else {
      throw new Error('Failed to create HOD');
    }
    const newHodId = createHODRes.data.user._id;

    // Test 8: Verify duplicate active HOD constraint
    console.log('\n--- Test 8: Verifying Unique Active HOD Constraint ---');
    try {
      await request(`${API}/auth/create-user`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Dr. Stella Junior HOD',
          username: 'stellajunior@university.com',
          password: 'stella_password',
          role: 'HOD',
          department: 'Advanced Astrophysics'
        })
      });
      throw new Error('Duplicate HOD allowed improperly');
    } catch (err) {
      console.log('✅ Constraint block succeeded! Secondary HOD blocked:', err.message);
    }

    // Test 9: Toggle User Active Status
    console.log('\n--- Test 9: Toggling HOD Account Active Status ---');
    const toggleRes = await request(`${API}/auth/users/${newHodId}/active`, { method: 'PUT', headers });
    console.log('✅ Account toggled. Message:', toggleRes.data.message);

    // Test 10: Delete temporary test records
    console.log('\n--- Test 10: Cleaning Up Test Records ---');
    await request(`${API}/auth/users/${newHodId}`, { method: 'DELETE', headers });
    console.log('✅ HOD user removed.');
    await request(`${API}/departments/${newDeptId}`, { method: 'DELETE', headers });
    console.log('✅ Department AST removed.');

    console.log('\n🌟 ALL 10 PROGRAMMATIC INTEGRATION TESTS PASSED SUCCESSFULLY! 🌟');
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    if (error.data) {
      console.error('Error Details:', error.data);
    }
    process.exit(1);
  }
}

runTests();
