import  { useState, useEffect } from 'react'
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API_URL } from '@/config'
import axios from 'axios'
import { ProxyTable } from './ProxyTable'


const sampleData = {
  insights: [
    {
      "_id": "666bf269fc6028694445d91b",
      "insight_type": "captcha",
      "insight_details": {
        "captcha_detected": true,
        "captcha_solved": true,
        "detected_time": "2024-06-14 07:34:01",
        "error_text": null,
        "solved_time": "2024-06-14 07:34:06"
      },
      "job_id": "84763c2f-0ac7-4c7e-b2cf-537b3c55908e"
    },
    {
      "_id": "666e9eb202c7761937cb9d75",
      "insight_type": "captcha",
      "insight_details": {
        "captcha_detected": true,
        "captcha_solved": false,
        "detected_time": "2024-06-16 08:13:38",
        "error_text": "No Audio Captcha Found",
        "solved_time": null
      },
      "job_id": "a2d4e4bb-adbf-412d-a435-1d8ced446a94"
    },
    {
      "_id": "667140eb02c7761937cb9de9",
      "insight_type": "captcha",
      "insight_details": {
        "captcha_detected": true,
        "captcha_solved": false,
        "detected_time": "2024-06-18 08:10:19",
        "error_text": "No Audio Captcha Found",
        "solved_time": null
      },
      "job_id": "a2d4e4bb-adbf-412d-a435-1d8ced446a94"
    }
  ]
}

export default function Dashboard() {
  const [data, setData] = useState(sampleData)
  const [selectedInsight, setSelectedInsight] = useState(data.insights[0]._id)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(10)

  const fetchInsights = async () => {
    const body: any =  {
        page_index: pageIndex,
        page_size: pageSize,
    }
    const response = await axios.post(`${API_URL}/get-all-insights`, body)
    return response.data.insights
  }

    useEffect(() => {
        fetchInsights().then((data) => {
            setData({ insights: data })
        })
    }, [pageIndex, pageSize])

  // Calculate solved vs unsolved captchas
  const solvedCount = data.insights.filter(insight => insight.insight_details.captcha_solved).length
  const unsolvedCount = data.insights.length - solvedCount

  const pieChartData = [
    { name: 'Solved', value: solvedCount },
    { name: 'Unsolved', value: unsolvedCount }
  ]

  // Calculate captchas per day
  const captchasPerDay = data.insights.reduce((acc: any, insight: any) => {
    const date = insight.insight_details.detected_time.split(' ')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const barChartData = Object.entries(captchasPerDay).map(([date, count]) => ({
    date,
    count
  }))

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))']

  // Prepare journey data for the selected insight
  const selectedInsightData: any = data.insights.find(insight => insight._id === selectedInsight)
  const journeyData = []

  if (selectedInsightData) {
    const detectedTime = new Date(selectedInsightData.insight_details.detected_time).getTime()
    journeyData.push({
      time: detectedTime,
      event: 'Detected',
      value: 1
    })

    if (selectedInsightData.insight_details.captcha_solved) {
      const solvedTime = new Date(selectedInsightData.insight_details.solved_time).getTime()
      journeyData.push({
        time: solvedTime,
        event: 'Solved',
        value: 2
      })
    } else if (selectedInsightData.insight_details.error_text) {
      journeyData.push({
        time: detectedTime + 1000, // Add 1 second to error time for visibility
        event: 'Error',
        value: 0,
        error: selectedInsightData.insight_details.error_text
      })
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6 [w-90vw]">
      <h1 className="text-3xl font-bold text-center mb-6">Proxy Insights Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Solved vs Unsolved Captchas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}-${entry}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Captchas Detected per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proxy Journey</CardTitle>
          <CardDescription>Timeline of detection, solving, and errors for a specific proxy</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedInsight} defaultValue={selectedInsight}>
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select an insight" />
            </SelectTrigger>
            <SelectContent>
              {data.insights.map(insight => (
                <SelectItem key={insight._id} value={insight._id}>
                  <span className='!capitalize'>{insight?.insight_type} - {insight.insight_details.detected_time}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="time" name="Time" domain={['dataMin', 'dataMax']} tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString()} />
              <YAxis type="number" dataKey="value" name="Event" ticks={[0, 1, 2]} tickFormatter={(value) => ['Error', 'Captcha Detected', 'Captcha Solved'][value]} />
              <ZAxis range={[100, 100]} />
              <Tooltip 
                formatter={(value, name, props) => {
                    console.log("first", value, name, props)
                  if (props.payload.error) {
                    return [props.payload.error, 'Error']
                  }
                  return [new Date(props.payload.time).toLocaleString(), props.payload.event]
                }}
              />
              <Legend />
              <Scatter name="Captcha Journey" data={journeyData} fill="hsl(var(--primary))" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Captcha Insights Table</CardTitle>
          <CardDescription>Detailed information about each captcha insight</CardDescription>
        </CardHeader>
        <CardContent>
          <ProxyTable data = {data.insights} setPageIndex = {setPageIndex} pageIndex = {pageIndex}/>
        </CardContent>
      </Card>
    </div>
  )
}