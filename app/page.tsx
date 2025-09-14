import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
import { ProtectedRoute } from "@/components/protected-route";

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-default-500 mt-1">Welcome back to your admin panel</p>
          </div>
          <Button color="primary" variant="shadow">
            Generate Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none bg-gradient-to-br from-pink-500 to-yellow-500 text-white">
            <CardBody className="justify-center items-start p-4">
              <div className="flex justify-between items-start w-full">
                <div>
                  <p className="text-white/80 text-sm font-medium">Total Users</p>
                  <p className="text-white text-2xl font-bold">2,847</p>
                </div>
                <div className="bg-white/20 rounded-lg p-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-white/80 text-xs">+12% from last month</span>
              </div>
            </CardBody>
          </Card>

          <Card className="border-none bg-gradient-to-br from-green-500 to-blue-500 text-white">
            <CardBody className="justify-center items-start p-4">
              <div className="flex justify-between items-start w-full">
                <div>
                  <p className="text-white/80 text-sm font-medium">Active Leagues</p>
                  <p className="text-white text-2xl font-bold">156</p>
                </div>
                <div className="bg-white/20 rounded-lg p-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-white/80 text-xs">+8% from last month</span>
              </div>
            </CardBody>
          </Card>

          <Card className="border-none bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardBody className="justify-center items-start p-4">
              <div className="flex justify-between items-start w-full">
                <div>
                  <p className="text-white/80 text-sm font-medium">Marketplace Sales</p>
                  <p className="text-white text-2xl font-bold">$12,847</p>
                </div>
                <div className="bg-white/20 rounded-lg p-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-white/80 text-xs">+23% from last month</span>
              </div>
            </CardBody>
          </Card>

          <Card className="border-none bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardBody className="justify-center items-start p-4">
              <div className="flex justify-between items-start w-full">
                <div>
                  <p className="text-white/80 text-sm font-medium">Revenue</p>
                  <p className="text-white text-2xl font-bold">$45,231</p>
                </div>
                <div className="bg-white/20 rounded-lg p-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-white/80 text-xs">+15% from last month</span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center w-full">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <Button size="sm" variant="light">View All</Button>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar size="sm" src="https://i.pravatar.cc/150?u=1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">John Doe joined Fantasy League #247</p>
                    <p className="text-xs text-default-500">2 minutes ago</p>
                  </div>
                  <Chip size="sm" color="success" variant="flat">New</Chip>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar size="sm" src="https://i.pravatar.cc/150?u=2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sarah Smith purchased Premium Item</p>
                    <p className="text-xs text-default-500">5 minutes ago</p>
                  </div>
                  <Chip size="sm" color="primary" variant="flat">Sale</Chip>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar size="sm" src="https://i.pravatar.cc/150?u=3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mike Johnson created new league</p>
                    <p className="text-xs text-default-500">10 minutes ago</p>
                  </div>
                  <Chip size="sm" color="secondary" variant="flat">League</Chip>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar size="sm" src="https://i.pravatar.cc/150?u=4" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Emma Wilson updated profile</p>
                    <p className="text-xs text-default-500">15 minutes ago</p>
                  </div>
                  <Chip size="sm" color="default" variant="flat">Update</Chip>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold">System Status</h3>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Server Load</span>
                    <span className="text-sm text-success">Normal</span>
                  </div>
                  <Progress value={65} color="success" size="sm" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Database</span>
                    <span className="text-sm text-success">Healthy</span>
                  </div>
                  <Progress value={85} color="success" size="sm" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">API Response</span>
                    <span className="text-sm text-warning">Slow</span>
                  </div>
                  <Progress value={45} color="warning" size="sm" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Storage</span>
                    <span className="text-sm text-success">Available</span>
                  </div>
                  <Progress value={72} color="success" size="sm" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 flex-col" variant="flat">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add User
              </Button>
              <Button className="h-20 flex-col" variant="flat">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Create League
              </Button>
              <Button className="h-20 flex-col" variant="flat">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add Product
              </Button>
              <Button className="h-20 flex-col" variant="flat">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Reports
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
