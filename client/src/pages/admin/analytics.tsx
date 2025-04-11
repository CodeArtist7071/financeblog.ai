import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { Loader2, TrendingUp, TrendingDown, Activity, User, FileText, Eye, MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/layouts/AdminLayout";

// Analytics data types
interface AnalyticsData {
  viewsByDay: { date: string; views: number }[];
  categoryCounts: { name: string; count: number }[];
  topPosts: { title: string; views: number }[];
  commentsByDay: { date: string; count: number }[];
  totalViews: number;
  totalPosts: number;
  totalComments: number;
  totalUsers: number;
  weeklyGrowth: {
    views: number;
    posts: number;
    comments: number;
  };
}

// Placeholder colors for charts
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0'];

// Dashboard component
export default function Analytics() {
  const [timeRange, setTimeRange] = useState<string>("week");

  // Fetch analytics data
  const { data: analyticsData, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics", timeRange],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary/70" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <p className="text-destructive mb-3">Failed to load analytics data</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // If we don't have real data, use sample data for demonstration
  const data = analyticsData || getSampleData(timeRange);

  return (
    <AdminLayout 
      title="Analytics Dashboard"
      description="View statistics and metrics for your finance and crypto blog"
    >
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-primary mr-2" />
            <div>
              <h2 className="text-2xl font-bold">Content Performance</h2>
              <p className="text-muted-foreground">Track and analyze your blog's metrics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Select 
              value={timeRange} 
              onValueChange={setTimeRange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Last 24 hours</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            title="Total Views" 
            value={data.totalViews.toLocaleString()} 
            trend={data.weeklyGrowth.views > 0 ? "up" : "down"}
            trendValue={`${Math.abs(data.weeklyGrowth.views)}%`}
            icon={<Eye className="h-5 w-5" />}
          />
          
          <MetricCard 
            title="Published Posts" 
            value={data.totalPosts.toLocaleString()} 
            trend={data.weeklyGrowth.posts > 0 ? "up" : "down"}
            trendValue={`${Math.abs(data.weeklyGrowth.posts)}%`}
            icon={<FileText className="h-5 w-5" />}
          />
          
          <MetricCard 
            title="Comments" 
            value={data.totalComments.toLocaleString()} 
            trend={data.weeklyGrowth.comments > 0 ? "up" : "down"}
            trendValue={`${Math.abs(data.weeklyGrowth.comments)}%`}
            icon={<MessageSquare className="h-5 w-5" />}
          />
          
          <MetricCard 
            title="Users" 
            value={data.totalUsers.toLocaleString()} 
            trend="up"
            trendValue="4%"
            icon={<User className="h-5 w-5" />}
          />
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.viewsByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="views" 
                          stroke="#0088FE" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Content by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.categoryCounts}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="count"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {data.categoryCounts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topPosts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="views" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="traffic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Search', value: 45 },
                          { name: 'Direct', value: 25 },
                          { name: 'Social', value: 20 },
                          { name: 'Referral', value: 10 }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {[0, 1, 2, 3].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Cryptocurrency', views: 4000, engagement: 2400 },
                        { name: 'Stocks', views: 3000, engagement: 1398 },
                        { name: 'Forex', views: 2000, engagement: 980 },
                        { name: 'Personal Finance', views: 2780, engagement: 1908 }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="views" fill="#0088FE" />
                      <Bar dataKey="engagement" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="engagement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.commentsByDay}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#FF8042" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  trend: "up" | "down";
  trendValue: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, trend, trendValue, icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <span className="text-2xl font-bold">{value}</span>
            <div className="flex items-center text-xs">
              {trend === "up" ? (
                <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4 text-rose-500" />
              )}
              <span className={trend === "up" ? "text-emerald-500" : "text-rose-500"}>
                {trend === "up" ? "+" : "-"}{trendValue} since last week
              </span>
            </div>
          </div>
          <div className="rounded-full p-2 bg-primary/10">
            <div className="text-primary">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to convert time range to text
function timeRangeToText(range: string): string {
  switch (range) {
    case "day": return "day";
    case "week": return "week";
    case "month": return "month";
    case "year": return "year";
    default: return "period";
  }
}

// Generate sample data for demonstration
function getSampleData(timeRange: string): AnalyticsData {
  // Generate dates based on selected time range
  const dates = [];
  const now = new Date();
  let numDays;
  
  switch (timeRange) {
    case "day":
      numDays = 24; // hours
      break;
    case "week":
      numDays = 7;
      break;
    case "month":
      numDays = 30;
      break;
    case "year":
      numDays = 12; // months
      break;
    default:
      numDays = 7;
  }
  
  for (let i = 0; i < numDays; i++) {
    const date = new Date();
    if (timeRange === "day") {
      date.setHours(now.getHours() - (numDays - i - 1));
      dates.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else if (timeRange === "year") {
      date.setMonth(now.getMonth() - (numDays - i - 1));
      dates.push(date.toLocaleDateString([], { month: 'short' }));
    } else {
      date.setDate(now.getDate() - (numDays - i - 1));
      dates.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
    }
  }
  
  // Generate sample data
  return {
    viewsByDay: dates.map((date, i) => ({
      date,
      views: Math.floor(Math.random() * 500) + 200 + (i * 10), // increasing trend
    })),
    categoryCounts: [
      { name: "Cryptocurrency", count: 42 },
      { name: "Stocks", count: 28 },
      { name: "Forex", count: 15 },
      { name: "Personal Finance", count: 20 },
      { name: "Blockchain", count: 18 }
    ],
    topPosts: [
      { title: "Bitcoin Analysis", views: 1245 },
      { title: "Stock Market Crash", views: 980 },
      { title: "Ethereum 2.0", views: 876 },
      { title: "Dollar vs Euro", views: 765 },
      { title: "Investing Tips", views: 654 }
    ],
    commentsByDay: dates.map((date, i) => ({
      date,
      count: Math.floor(Math.random() * 50) + 10 + (i * 2), // increasing trend
    })),
    totalViews: 35782,
    totalPosts: 123,
    totalComments: 842,
    totalUsers: 567,
    weeklyGrowth: {
      views: 12,
      posts: 8,
      comments: -3
    }
  };
}