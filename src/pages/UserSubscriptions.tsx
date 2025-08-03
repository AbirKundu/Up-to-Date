import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard, Package, Calendar, Trash2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const UserSubscriptions = () => {
  const { user } = useAuth();
  const {
    packages,
    userSubscriptions,
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    purchaseFromCart,
    cancelSubscription
  } = useSubscriptionPackages();

  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    await purchaseFromCart();
    setPurchasing(false);
  };

  const activeSubscription = userSubscriptions.find(sub => sub.status === 'active');
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.subscription_packages?.price || 0), 0);
  const creditsAvailable = activeSubscription?.credits_remaining || 0;
  const finalPrice = Math.max(0, cartTotal - creditsAvailable);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading subscriptions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Subscription Store</h1>
          <p className="text-muted-foreground">Browse and purchase subscription packages</p>
        </div>

        {/* Current Subscription Status */}
        {activeSubscription && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                Active Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Package</p>
                  <p className="font-semibold">{activeSubscription.subscription_packages?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="font-semibold">{activeSubscription.expires_at ? formatDate(activeSubscription.expires_at) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credits Available</p>
                  <p className="font-semibold text-green-600">৳{creditsAvailable.toFixed(2)}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => cancelSubscription(activeSubscription.id)}
              >
                Cancel Subscription
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Shopping Cart */}
        {cartItems.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Cart ({cartItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{item.subscription_packages?.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.subscription_packages?.description}</p>
                      <p className="font-semibold text-primary">৳{item.subscription_packages?.price}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>৳{cartTotal.toFixed(2)}</span>
                  </div>
                  {creditsAvailable > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Credits Applied:</span>
                      <span>-৳{Math.min(creditsAvailable, cartTotal).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>৳{finalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handlePurchase}
                  disabled={purchasing}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {purchasing ? 'Processing...' : 'Complete Purchase'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Packages */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Package className="h-6 w-6" />
            Available Packages
          </h2>
          
          {packages.length === 0 ? (
            <Alert>
              <AlertDescription>
                No subscription packages are currently available. Please check back later.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-primary">
                        ৳{pkg.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{pkg.billing_cycle}
                        </span>
                      </div>
                      <Badge variant="secondary">{pkg.billing_cycle}</Badge>
                      {pkg.features && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Features:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {Array.isArray(pkg.features) ? pkg.features.map((feature: string, index: number) => (
                              <li key={index}>• {feature}</li>
                            )) : (
                              <li>• {pkg.features}</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => addToCart(pkg.id)}
                      disabled={cartItems.some(item => item.package_id === pkg.id) || 
                               (activeSubscription?.package_id === pkg.id && activeSubscription.status === 'active')}
                    >
                      {cartItems.some(item => item.package_id === pkg.id) ? 'In Cart' :
                       (activeSubscription?.package_id === pkg.id && activeSubscription.status === 'active') ? 'Current Plan' :
                       'Add to Cart'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Subscription History */}
        {userSubscriptions.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Subscription History
            </h2>
            <div className="space-y-4">
              {userSubscriptions.map((subscription) => (
                <Card key={subscription.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Package</p>
                        <p className="font-semibold">{subscription.subscription_packages?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                          {subscription.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Started</p>
                        <p className="font-semibold">{formatDate(subscription.started_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className="font-semibold">৳{subscription.total_paid}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSubscriptions;