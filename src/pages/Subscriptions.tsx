import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSubscriptions, Subscription } from '@/hooks/useSubscriptions';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { AddSubscriptionDialog } from '@/components/AddSubscriptionDialog';
import { AdminSubscriptionManager } from '@/components/AdminSubscriptionManager';
import { useAuth } from '@/hooks/useAuth';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  RefreshCw,
  BarChart3,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';

const Subscriptions = () => {
  const { isAdmin } = useAuth();
  const { 
    subscriptions, 
    loading, 
    addSubscription,
    updateSubscription, 
    deleteSubscription, 
    updateUsage,
    refetch,
    getMonthlyTotal,
    getUpcomingPayments 
  } = useSubscriptions();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.provider?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || sub.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && sub.is_active) ||
                         (statusFilter === 'inactive' && !sub.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateSubscription(id, { is_active: isActive });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      await deleteSubscription(id);
    }
  };

  const monthlyTotal = getMonthlyTotal();
  const upcomingPayments = getUpcomingPayments();
  const activeCount = subscriptions.filter(sub => sub.is_active).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl">Loading subscriptions...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Subscription Manager</h1>
              <p className="text-muted-foreground">Track and manage all your subscriptions</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={refetch}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <AddSubscriptionDialog />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Admin View */}
        {isAdmin ? (
          <AdminSubscriptionManager
            subscriptions={subscriptions}
            onCreatePackage={addSubscription}
            onUpdatePackage={updateSubscription}
            onDeletePackage={deleteSubscription}
          />
        ) : (
          <>
            {/* User Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{activeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Total</p>
                  <p className="text-2xl font-bold">৳{monthlyTotal.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Yearly Estimate</p>
                  <p className="text-2xl font-bold">৳{(monthlyTotal * 12).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Next Payment</p>
                  <p className="text-2xl font-bold">
                    {upcomingPayments[0] ? format(new Date(upcomingPayments[0].next_billing_date!), 'MMM dd') : 'None'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Payments */}
        {upcomingPayments.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Payments
              </CardTitle>
              <CardDescription>Your next 5 subscription payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPayments.map((sub) => (
                  <div key={sub.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {format(new Date(sub.next_billing_date!), 'MMM dd')}
                      </Badge>
                      <span className="font-medium">{sub.name}</span>
                      <Badge variant="secondary">{sub.category}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">৳{sub.cost.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{sub.billing_cycle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions Grid */}
        {filteredSubscriptions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No subscriptions found</h3>
              <p className="text-muted-foreground mb-6">
                {subscriptions.length === 0 
                  ? "Get started by adding your first subscription"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {subscriptions.length === 0 && <AddSubscriptionDialog />}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onEdit={setEditingSubscription}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onUpdateUsage={updateUsage}
              />
            ))}
          </div>
        )}

            {/* Edit Dialog */}
            {editingSubscription && (
              <AddSubscriptionDialog
                editingSubscription={editingSubscription}
                onEditComplete={() => setEditingSubscription(null)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Subscriptions;