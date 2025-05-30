export default function PortalSelector() {
    return (
        <div className="flex-center" style={{ minHeight: '100vh', backgroundColor: 'var(--background-gray)' }}>
            <div style={{ textAlign: 'center' }}>

                {/* Main Header */}
                <div className="mb-8">
                    <div style={{
                        width: '80px', height: '80px', backgroundColor: 'var(--primary-green)',
                        borderRadius: '16px', margin: '0 auto 1.5rem', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <span style={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}>C</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Mini CRM</h1>
                    <p style={{ color: 'var(--text-gray)', fontSize: '1.125rem' }}>Choose your portal to continue</p>
                </div>

                {/* Portal Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '900px' }}>

                    {/* Admin Portal */}
                    <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/admin-login'}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Admin Portal</h3>
                        <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            Super Administrator Access
                        </p>
                        <button className="btn btn-primary">Access Admin Portal</button>
                    </div>

                    {/* Manager Portal */}
                    <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/manager-login'}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍💼</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Manager Portal</h3>
                        <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            Management Team Access
                        </p>
                        <button className="btn btn-primary">Access Manager Portal</button>
                    </div>

                    {/* Employee Portal */}
                    <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => window.location.href = '/employee-login'}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍💻</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Employee Portal</h3>
                        <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            Employee Access
                        </p>
                        <button className="btn btn-primary">Access Employee Portal</button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8">
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem' }}>
                        Need help? Contact your system administrator
                    </p>
                </div>
            </div>
        </div>
    );
}