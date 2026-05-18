interface StatsCardsProps {
  stats: {
    total: number;
    byStatus: {
      new: number;
      contacted: number;
      qualified: number;
      lost: number;
    };
    bySource: {
      website: number;
      instagram: number;
      referral: number;
      linkedin: number;
    };
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const statusCards = [
    { label: 'Total Leads',  value: stats.total,              color: 'border-l-gray-500',   bg: 'bg-gray-50' },
    { label: 'New',          value: stats.byStatus.new,       color: 'border-l-blue-500',   bg: 'bg-blue-50' },
    { label: 'Contacted',    value: stats.byStatus.contacted, color: 'border-l-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Qualified',    value: stats.byStatus.qualified, color: 'border-l-green-500',  bg: 'bg-green-50' },
    { label: 'Lost',         value: stats.byStatus.lost,      color: 'border-l-red-500',    bg: 'bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {statusCards.map((card, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg shadow p-4 border-l-4 ${card.color}`}
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {card.label}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;