import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Download, Upload, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useQuery } from '@tanstack/react-query';
import { getTournaments } from '@/services/lojasTorneiosService';
import { getMonthlyTournaments, getFormatData, getRecentTournaments, getUpcomingTournaments } from '@/selectors/tournaments.selectors'; 
import Spinner from '../ui/Spinner';


export default function OrganizerDashboard() {
  const { user } = useAuthContext();
  const { data: tournaments = [], isLoading } = useQuery({
      queryKey: ["tournaments"],
      queryFn: getTournaments,
      retry: false
    })

    const monthlyData = getMonthlyTournaments(tournaments)
    const formatData = getFormatData(tournaments)
    const upcomingTournaments = getUpcomingTournaments(tournaments)
    const recentTournaments = getRecentTournaments(tournaments)

  if (isLoading) return <Spinner />

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.nome}!</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link 
          to="/organizer/create-tournament"
          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Tournament</span>
        </Link>
        <button className="bg-white border border-gray-300 text-gray-700 p-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Export Data</span>
        </button>
        <Link
          to="/organizer/pos"
          className="bg-white border border-gray-300 text-gray-700 p-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
        >
          <Users className="w-5 h-5" />
          <span>Manage Players</span>
        </Link>
        <button className="bg-white border border-gray-300 text-gray-700 p-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Manage Ads</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/organizer/tournaments"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-sm text-gray-600 mb-1">Active Tournaments</div>
          <div className="text-3xl text-gray-900">8</div>
          <div className="text-xs text-green-600 mt-1">+2 from last week</div>
        </Link>
        <Link
          to="/organizer/tournaments"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-sm text-gray-600 mb-1">Total Participants</div>
          <div className="text-3xl text-gray-900">247</div>
          <div className="text-xs text-green-600 mt-1">+15% this month</div>
        </Link>
        <Link
          to="/organizer/tournaments"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-sm text-gray-600 mb-1">Completed Events</div>
          <div className="text-3xl text-gray-900">156</div>
          <div className="text-xs text-gray-600 mt-1">All time</div>
        </Link>
        <Link
          to="/organizer/tournaments"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="text-sm text-gray-600 mb-1">Avg. Attendance</div>
          <div className="text-3xl text-gray-900">24</div>
          <div className="text-xs text-gray-600 mt-1">per tournament</div>
        </Link>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl mb-4 text-gray-900">Monthly Tournament Activity</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tournaments" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Format Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl mb-4 text-gray-900">Format Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={formatData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent ?? 0 * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {formatData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tournament Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tournaments */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl mb-4 text-gray-900">Upcoming Tournaments</h2>
          <div className="space-y-3">
            {upcomingTournaments.map((tournament) => (
              <Link
                key={tournament.id}
                to={`/organizer/edit-tournament/${tournament.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors block"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-gray-900">{tournament.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(tournament.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {tournament.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{tournament.players.length} players</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Tournaments */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl mb-4 text-gray-900">Recent Tournaments</h2>
          <div className="space-y-3">
            {recentTournaments.map((tournament) => (
              <div key={tournament.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-gray-900">{tournament.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(tournament.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{tournament.players.length} players</span>
                  <span className="text-purple-600">Winner: {tournament.winner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}