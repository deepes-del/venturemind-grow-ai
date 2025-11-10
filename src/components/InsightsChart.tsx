import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Activity } from "lucide-react";

interface Insight {
  id: string;
  problem_statement: string;
  insights_text: string;
  created_at: string;
}

interface InsightsChartProps {
  insights: Insight[];
}

const COLORS = ['hsl(280 85% 62%)', 'hsl(335 85% 60%)', 'hsl(190 85% 55%)', 'hsl(240 85% 62%)', 'hsl(160 85% 55%)'];

const InsightsChart = ({ insights }: InsightsChartProps) => {
  // Generate timeline data - insights created over time
  const timelineData = insights
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((insight, index) => ({
      name: new Date(insight.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      insights: index + 1,
      date: insight.created_at
    }));

  // Generate insights length distribution
  const lengthData = insights.map((insight, index) => ({
    name: `Insight ${index + 1}`,
    words: insight.insights_text.split(/\s+/).length,
    problem: insight.problem_statement.substring(0, 30) + '...'
  }));

  // Problem category distribution (simplified - counting keywords)
  const problemKeywords: { [key: string]: number } = {};
  insights.forEach(insight => {
    const words = insight.problem_statement.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 4) { // Only count meaningful words
        problemKeywords[word] = (problemKeywords[word] || 0) + 1;
      }
    });
  });

  const topKeywords = Object.entries(problemKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Total Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: 'hsl(var(--heading-primary))' }}>
              {insights.length}
            </div>
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--text-secondary))' }}>
              Generated analyses
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-secondary" />
              Avg. Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: 'hsl(var(--heading-primary))' }}>
              {Math.round(lengthData.reduce((acc, curr) => acc + curr.words, 0) / lengthData.length) || 0}
            </div>
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--text-secondary))' }}>
              Per insight
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Latest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold" style={{ color: 'hsl(var(--heading-primary))' }}>
              {insights.length > 0 ? new Date(insights[0].created_at).toLocaleDateString() : 'N/A'}
            </div>
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--text-secondary))' }}>
              Most recent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: 'hsl(var(--heading-secondary))' }}>
              Insights Timeline
            </CardTitle>
            <CardDescription>Cumulative insights generated over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--text-secondary))' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--text-secondary))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="insights" 
                  stroke="hsl(280 85% 62%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(280 85% 62%)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Word Count Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: 'hsl(var(--heading-secondary))' }}>
              Insight Length
            </CardTitle>
            <CardDescription>Word count for each insight</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={lengthData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--text-secondary))' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--text-secondary))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="words" 
                  fill="hsl(335 85% 60%)" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Problem Keywords */}
        {topKeywords.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base" style={{ color: 'hsl(var(--heading-secondary))' }}>
                Common Problem Keywords
              </CardTitle>
              <CardDescription>Most frequent words in problem statements</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={topKeywords}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topKeywords.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InsightsChart;
