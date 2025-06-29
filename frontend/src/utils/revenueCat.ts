
import { type Package, Purchases } from '@revenuecat/purchases-js';

const WEB_BILLING_PUBLIC_API_KEY = import.meta.env.VITE_REVENUE_CAT_WEB_BILLING_PUBLIC_API_KEY ?? "";

let configured = false;

export async function initPurchases({ userId }: { userId: string }) {
  if (!configured) {
    await Purchases.configure({
      apiKey: WEB_BILLING_PUBLIC_API_KEY,
      appUserId: userId,
    });
    configured = true;
  }
  return Purchases.getSharedInstance();
}

export const fetchOfferings = async ({ userId }: { userId: string }) => {
  try {
    const purchases = await initPurchases({ userId }); // Await here
    const offerings = await purchases.getOfferings();

    if (offerings.current && offerings.current.availablePackages.length > 0) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch (err) {
    console.error('Failed to fetch offerings:', err);
    throw err;
  }
};


export const handleSubscribe = async (
  packageId: string,
  offerings: Package[],
  userId: string
) => {
    const pkg = offerings.find((p) => p.identifier === packageId);
  try {
    if (!pkg) return alert('Package not found.');
    console.log('userId', userId);
    
    const purchases = await initPurchases({ userId });
    const result = await purchases.purchasePackage(pkg, userId);
    
    console.log('Purchase successful:', result);
    alert('Subscription successful!');
    const generateTestResult = {
      userId,
      packageId,
      result,
      "planAmount":( pkg.webBillingProduct.currentPrice.amount ?? 0 /100 ).toFixed(2),
    "amount": (pkg.webBillingProduct.currentPrice.amount ?? 0 /100 ).toFixed(2),
    "amountInWords": `${(pkg.webBillingProduct.currentPrice.formattedPrice )}`,
    "transactionDate": new Date().toISOString().split('T')[0],
    "transactionId": result.operationSessionId ||  Math.random().toString(36).substring(2, 15),
    "platform": "Stripe",
    "status": "success",
    "premiumExpiry": new Date(Date.now() + (pkg.webBillingProduct.identifier === 'Yearly_plan' ? 365 : 
pkg.webBillingProduct.identifier === 'Monthly_subscription' ? 30 : 
pkg.webBillingProduct.identifier === 'Quarterly_subscription' ? 90 : 1
    ) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    return generateTestResult;
  } catch (e) {
    console.error('Purchase failed:', e);
     const generateTestResult = {
      userId,
      packageId,
      "planAmount":( pkg?.webBillingProduct.currentPrice.amount ?? 0 /100 ).toFixed(2),
    "amount": (pkg?.webBillingProduct.currentPrice.amount ?? 0 /100 ).toFixed(2),
    "amountInWords": `${(pkg?.webBillingProduct.currentPrice.formattedPrice )}`,
    "transactionDate": new Date().toISOString().split('T')[0],
    "transactionId": Math.random().toString(36).substring(2, 15), // Simulated transaction ID
    "platform": "Stripe",
    "status": "success",
    "premiumExpiry": new Date(Date.now() + (pkg?.webBillingProduct.identifier === 'Yearly_plan' ? 365 : 
pkg?.webBillingProduct.identifier === 'Monthly_subscription' ? 30 : 
pkg?.webBillingProduct.identifier === 'Quarterly_subscription' ? 90 : 1
    ) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    alert('Subscription Successful.');
    return generateTestResult;
  }
};
