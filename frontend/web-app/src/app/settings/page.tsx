"use client";
import { Button } from "@/components/ui/button";
import SwirlBackground from "@/components/SwirlBackground";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// Eye icon SVGs
const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="8" ry="5" /><circle cx="12" cy="12" r="2.5" /><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" opacity=".2"/></svg>
) : (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="8" ry="5" /><path d="M3 3l18 18" stroke="#b0b3c7" strokeWidth="2"/><circle cx="12" cy="12" r="2.5" /><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" opacity=".2"/></svg>
);

const sidebarItems = [
  { name: "Home", icon: "/icons/home.svg", route: "/" },
  { name: "Highlights", icon: "/icons/highlights.svg", route: "/highlights" },
  { name: "Collections", icon: "/icons/collections.svg", route: "/collection" },
  { name: "Settings", icon: "/icons/settings.svg", route: "/settings" },
];

function getCookie(name: string) {
  return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
}

export default function SettingsPage() {
  const router = useRouter();
  // Profile state
  const [user, setUser] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  // Security state
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [changePwError, setChangePwError] = useState<string | null>(null);
  const [changePwSuccess, setChangePwSuccess] = useState<string | null>(null);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  // Account state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  // General loading
  const [loading, setLoading] = useState(false);
  const [showId, setShowId] = useState(false);

  // Fetch user info on mount
  useEffect(() => {
    // Redirect to login if not authenticated
    if (typeof window !== 'undefined' && !getCookie('access_token')) {
      router.replace('/login');
      return;
    }
    async function fetchUser() {
      setProfileLoading(true);
      setProfileError(null);
      const token = getCookie('access_token');
      if (!token) {
        setProfileError('Not authenticated.');
        setProfileLoading(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch user info');
        const data = await res.json();
        setUser(data);
        setEditUsername(data.username);
        setEditEmail(data.email);
      } catch (err) {
        setProfileError('Could not load user info');
      } finally {
        setProfileLoading(false);
      }
    }
    fetchUser();
  }, []);

  // Profile update
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setLoading(true);
    const token = getCookie('access_token');
    if (!token || !user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: editUsername, email: editEmail })
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setProfileSuccess('Profile updated!');
      setUser({ ...user, username: editUsername, email: editEmail });
    } catch (err) {
      setProfileError('Could not update profile');
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwError(null);
    setChangePwSuccess(null);
    setChangePwLoading(true);
    if (pw1 !== pw2) {
      setChangePwError('Passwords do not match.');
      setChangePwLoading(false);
      return;
    }
    try {
      // Request reset token
      const token = getCookie('access_token');
      if (!token || !user) throw new Error('Not authenticated');
      const reqRes = await fetch('http://localhost:5000/api/auth/reset-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: user.email })
      });
      if (!reqRes.ok) throw new Error('Failed to request reset');
      const reqData = await reqRes.json();
      const resetToken = reqData.token;
      // Reset password
      const resetRes = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, new_password: pw1 })
      });
      if (!resetRes.ok) throw new Error('Failed to reset password');
      setChangePwSuccess('Password changed successfully!');
      setPw1(""); setPw2("");
    } catch (err) {
      setChangePwError('Could not change password');
    } finally {
      setChangePwLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setDeleteSuccess(null);
    setDeleteLoading(true);
    const token = getCookie('access_token');
    if (!token || !user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete account');
      setDeleteSuccess('Account deleted. Logging out...');
      setTimeout(() => {
        document.cookie = 'access_token=; Max-Age=0; path=/;';
        window.location.href = '/login';
      }, 1500);
    } catch (err) {
      setDeleteError('Could not delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    document.cookie = 'access_token=; Max-Age=0; path=/;';
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-[#181c2f] to-[#23243a]">
      {/* Sidebar */}
      <aside className="w-[90px] min-w-[72px] max-w-[120px] h-screen flex flex-col justify-between items-center bg-[#20223a]/80 shadow-xl py-8">
        <div className="flex flex-col gap-8 items-center flex-1 justify-center">
          {/* Home at the top */}
          <div
            key={sidebarItems[0].name}
            title={sidebarItems[0].name}
            className={`flex items-center justify-center w-14 h-14 rounded-2xl cursor-pointer transition-colors text-[#b0b3c7] hover:bg-[#23243a]/60`}
            onClick={() => router.push(sidebarItems[0].route)}
          >
            <Image src={sidebarItems[0].icon} alt={sidebarItems[0].name} width={24} height={24} style={{ filter: 'invert(0.7)' }} />
          </div>
          {/* Highlights and Collections in the middle */}
          {sidebarItems.slice(1, 3).map((item) => (
            <div
              key={item.name}
              title={item.name}
              className={`flex items-center justify-center w-14 h-14 rounded-2xl cursor-pointer transition-colors text-[#b0b3c7] hover:bg-[#23243a]/60`}
              onClick={() => router.push(item.route)}
            >
              <Image src={item.icon} alt={item.name} width={24} height={24} style={{ filter: 'invert(0.7)' }} />
            </div>
          ))}
        </div>
        {/* Settings at the bottom, highlighted as active */}
        <div
          key={sidebarItems[3].name}
          title={sidebarItems[3].name}
          className={`flex items-center justify-center w-14 h-14 rounded-2xl cursor-pointer transition-colors bg-gradient-to-br from-[#7f5fff] to-[#5e8bff] text-white shadow-lg mb-2`}
          onClick={() => router.push(sidebarItems[3].route)}
        >
          <Image src={sidebarItems[3].icon} alt={sidebarItems[3].name} width={24} height={24} style={{ filter: 'invert(1)' }} />
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-y-auto min-h-screen">
        <SwirlBackground />
        <div className="relative w-full max-w-2xl mx-auto flex flex-col items-stretch rounded-3xl shadow-2xl p-8 md:p-12 bg-gradient-to-br from-[#181c2f]/90 to-[#23243a]/90 z-10 gap-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white leading-tight">{user?.username || 'Username'}</span>
              <span className="text-sm text-[#b0b3c7] mt-1">{user?.email || 'user@email.com'}</span>
            </div>
            <Image src="/logo.png" alt="StudyAid Logo" width={56} height={56} />
          </div>

          {/* Profile Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-white mb-2">Profile</h2>
            <form className="flex flex-col gap-4" onSubmit={handleProfileSave}>
              <div className="flex gap-4 flex-col md:flex-row">
                <div className="flex-1 flex flex-col">
                  <label className="text-[#b0b3c7] text-sm mb-1">Username</label>
                  <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} className="rounded-xl px-6 py-3 bg-[#23243a] text-white placeholder-[#b0b3c7] border border-[#23243a] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#7f5fff] shadow" />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="text-[#b0b3c7] text-sm mb-1">Email</label>
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="rounded-xl px-6 py-3 bg-[#23243a] text-white placeholder-[#b0b3c7] border border-[#23243a] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#7f5fff] shadow" />
                </div>
              </div>
              <div className="flex gap-4 flex-col md:flex-row">
                <div className="flex-1 flex flex-col relative">
                  <label className="text-[#b0b3c7] text-sm mb-1">User ID</label>
                  <input
                    type={showId ? "text" : "password"}
                    value={user?.id || ''}
                    readOnly
                    className="rounded-xl px-6 py-3 pr-10 bg-[#23243a] text-[#b0b3c7] border border-[#23243a] text-base font-medium select-all"
                    style={{ letterSpacing: showId ? 'normal' : '0.15em' }}
                  />
                  <button
                    type="button"
                    aria-label={showId ? 'Hide ID' : 'Show ID'}
                    onClick={() => setShowId(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#b0b3c7] hover:text-white focus:outline-none"
                    tabIndex={0}
                  >
                    <EyeIcon open={showId} />
                  </button>
                </div>
                <div className="flex-1"></div>
              </div>
              <div className="flex flex-row gap-4 mt-2">
                <Button type="submit" className="w-full rounded-xl font-semibold bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white shadow-md hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors py-3 text-base" disabled={loading || profileLoading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
              </div>
              {profileError && <div style={{ color: '#ff6b6b', marginTop: 4, textAlign: 'center', fontSize: '0.98rem' }}>{profileError}</div>}
              {profileSuccess && <div style={{ color: '#4ade80', marginTop: 4, textAlign: 'center', fontSize: '0.98rem' }}>{profileSuccess}</div>}
            </form>
          </section>

          {/* Security Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-white mb-2">Security</h2>
            <form className="flex flex-col gap-4" onSubmit={handleChangePassword}>
              <div className="flex gap-4 flex-col md:flex-row">
                <div className="flex-1 flex flex-col">
                  <label className="text-[#b0b3c7] text-sm mb-1">New Password</label>
                  <input type="password" value={pw1} onChange={e => setPw1(e.target.value)} className="rounded-xl px-6 py-3 bg-[#23243a] text-white placeholder-[#b0b3c7] border border-[#23243a] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#7f5fff] shadow" />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="text-[#b0b3c7] text-sm mb-1">Confirm Password</label>
                  <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} className="rounded-xl px-6 py-3 bg-[#23243a] text-white placeholder-[#b0b3c7] border border-[#23243a] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#7f5fff] shadow" />
                </div>
              </div>
              <div className="flex-1"></div>
              <div className="flex flex-row gap-4 mt-2">
                <Button type="submit" className="w-full rounded-xl font-semibold bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white shadow-md hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors py-3 text-base" disabled={changePwLoading}>{changePwLoading ? 'Changing...' : 'Change Password'}</Button>
              </div>
              {changePwError && <div style={{ color: '#ff6b6b', marginTop: 4, textAlign: 'center', fontSize: '0.98rem' }}>{changePwError}</div>}
              {changePwSuccess && <div style={{ color: '#4ade80', marginTop: 4, textAlign: 'center', fontSize: '0.98rem' }}>{changePwSuccess}</div>}
            </form>
          </section>

          {/* Account Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-white mb-2">Account</h2>
            <div className="flex flex-row gap-4">
              <Button variant="destructive" className="w-full rounded-xl font-semibold py-3 text-base" onClick={handleDeleteAccount} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete Account'}</Button>
              <Button variant="secondary" className="w-full rounded-xl font-semibold py-3 text-base" onClick={handleLogout}>Logout</Button>
            </div>
            {deleteError && <div style={{ color: '#ff6b6b', marginTop: 4, textAlign: 'center', fontSize: '0.98rem' }}>{deleteError}</div>}
            {deleteSuccess && <div style={{ color: '#4ade80', marginTop: 4, textAlign: 'center', fontSize: '0.98rem' }}>{deleteSuccess}</div>}
          </section>

          {/* Admin Section (only if admin) */}
          {user?.is_admin && (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-white mb-2">Admin</h2>
              <div className="flex gap-4 flex-col md:flex-row">
                <div className="flex-1 flex flex-col">
                  <label className="text-[#b0b3c7] text-sm mb-1">Admin Status</label>
                  <input type="text" value={user.is_admin ? 'Admin' : 'User'} readOnly className="rounded-xl px-6 py-3 bg-[#23243a] text-[#b0b3c7] border border-[#23243a] text-base font-medium" />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="text-[#b0b3c7] text-sm mb-1">Granted By</label>
                  <input type="text" value={user.admin_granted_by || ''} readOnly className="rounded-xl px-6 py-3 bg-[#23243a] text-[#b0b3c7] border border-[#23243a] text-base font-medium" />
                </div>
              </div>
              <div className="flex gap-4 flex-col md:flex-row">
                <div className="flex-1 flex flex-col">
                  <label className="text-[#b0b3c7] text-sm mb-1">Granted At</label>
                  <input type="text" value={user.admin_granted_at ? new Date(user.admin_granted_at).toLocaleString() : ''} readOnly className="rounded-xl px-6 py-3 bg-[#23243a] text-[#b0b3c7] border border-[#23243a] text-base font-medium" />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="text-[#b0b3c7] text-sm mb-1">Grant Reason</label>
                  <input type="text" value={user.admin_grant_reason || ''} readOnly className="rounded-xl px-6 py-3 bg-[#23243a] text-[#b0b3c7] border border-[#23243a] text-base font-medium" />
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
} 