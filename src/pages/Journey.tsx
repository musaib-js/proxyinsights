import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, CartesianGrid } from 'recharts';
import { ChartContainer } from "@/components/ui/chart";
import { proxyData } from './data';

interface InsightDetails {
  captcha_detected: boolean;
  captcha_solved: boolean;
  detected_time: string;
  solved_time: string | null;
  error_text: string | null;
}

interface Insight {
  insight_details: InsightDetails;
  insight_id: string;
  insight_type: string;
  job_id: string;
}

interface ProxyDetails {
  proxy_address: string;
  created_at: string;
}

interface ProxyData {
  insights: Insight[];
  proxy_address: string | null;
  proxy_details: ProxyDetails | null;
}

const eventTypes = ['Detected', 'Solved', 'Failed'];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const processData = (insights: Insight[]) => {
  return insights.map((insight, index) => {
    const detectedDate = new Date(insight.insight_details.detected_time);
    const event: any = {
      index,
      date: formatDate(insight.insight_details.detected_time),
      time: detectedDate.getTime(),
      Detected: 1,
    };

    if (insight.insight_details.captcha_solved) {
      const solvedDate = new Date(insight.insight_details.solved_time!);
      event.Solved = 2;
      event.solvedTime = solvedDate.getTime();
    } else if (insight.insight_details.error_text) {
      event.Failed = 3;
    }

    return event;
  });
};

const chartConfig = {
    Detected: {
      label: "Detected",
      color: "hsl(var(--chart-1))",
    },
    Solved: {
      label: "Solved",
      color: "hsl(var(--chart-2))",
    },
    Failed: {
      label: "Failed",
      color: "hsl(var(--chart-3))",
    },
  };

  const aggregateData = (insights: Insight[]) => {
    const aggregated: Record<string, { Detected: number; Solved: number; Failed: number }> = {};
  
    insights.forEach((insight) => {
      const date = formatDate(insight.insight_details.detected_time);
      if (!aggregated[date]) {
        aggregated[date] = { Detected: 0, Solved: 0, Failed: 0 };
      }
  
      aggregated[date].Detected += 1;
  
      if (insight.insight_details.captcha_solved) {
        aggregated[date].Solved += 1;
      } else if (insight.insight_details.error_text) {
        aggregated[date].Failed += 1;
      }
    });
  
    return Object.entries(aggregated).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  };
  
  const ProxyJourneyChart: React.FC<{ proxyData: ProxyData[] }> = ({ proxyData }) => {
    return (
      <div className="w-full space-y-8">
        {proxyData.map((proxy, index) => {
          if (!proxy.proxy_details) return null;
  
          const chartData = aggregateData(proxy.insights);
  
          return (
            <Card key={index} className="w-full">
              <CardHeader>
                <CardTitle>Proxy Journey: {proxy.proxy_address}</CardTitle>
              </CardHeader>
              <CardContent>
              <ResponsiveContainer width="100%" height={400}>
  <ComposedChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="Detected" fill="#8884d8" />
    <Bar dataKey="Solved" fill="#82ca9d" />
    <Bar dataKey="Failed" fill="#ff7300" />
    <Line type="monotone" dataKey="Total Captchas" stroke="#000000" />
  </ComposedChart>
</ResponsiveContainer>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
  

export default function ProxyJourneyChartWrapper() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Proxy Journey Charts</h1>
      <ProxyJourneyChart proxyData={proxyData} />
    </div>
  );
}

