import dynamic from 'next/dynamic';

const StockChart = dynamic(() => import('./StockChart'), { ssr: false });

const ChartPage = () => {
  return <StockChart />;
};

export default ChartPage;