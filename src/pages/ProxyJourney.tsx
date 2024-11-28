import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ProxyJourneyData {
  insights: {
    insight_details: {
      captcha_detected: boolean;
      captcha_solved: boolean;
      detected_time: string;
      solved_time: string | null;
      error_text: string | null;
    };
    insight_id: string;
    insight_type: string;
  }[];
  proxy_details: {
    created_at: string;
  };
}

const ProxyJourneyChart: React.FC<{ data: ProxyJourneyData }> = ({ data }) => {
  // Prepare journey data for the chart
  const journeyData = data.insights.map((insight, index) => {
    const { detected_time, solved_time, captcha_detected, captcha_solved } = insight.insight_details;

    return {
      name: `Event ${index + 1}`,
      time: detected_time,
      captchaDetected: captcha_detected ? 1 : 0,
      captchaSolved: captcha_solved ? 1 : 0,
      unresolved: captcha_detected && !captcha_solved ? 1 : 0,
    };
  });

  // Add the starting point (created_at)
  journeyData.unshift({
    name: "Created",
    time: data.proxy_details.created_at,
    captchaDetected: 0,
    captchaSolved: 0,
    unresolved: 0,
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={journeyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" label={{ value: "Time", position: "insideBottomRight", offset: 0 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="captchaDetected" stroke="#8884d8" name="Captcha Detected" />
        <Line type="monotone" dataKey="captchaSolved" stroke="#82ca9d" name="Captcha Solved" />
        <Line type="monotone" dataKey="unresolved" stroke="#ff4d4f" name="Unresolved Captcha" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProxyJourneyChart;
