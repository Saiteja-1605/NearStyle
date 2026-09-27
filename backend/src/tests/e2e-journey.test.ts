import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testFullJourney() {
  console.log('====================================================');
  console.log('🚀 NEARSTYLE COMPREHENSIVE END-TO-END VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // 1. PUBLIC APIS
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Public Endpoints ---');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    assert(healthRes.status === 200 && healthRes.data.status === 'ok', 'Health Check API returns ok');

    const storesRes = await axios.get(`${BASE_URL}/stores`);
    assert(Array.isArray(storesRes.data) && storesRes.data.length >= 6, `Found ${storesRes.data.length} stores (>= 6)`);

    const bandraStores = await axios.get(`${BASE_URL}/stores?area=Bandra`);
    assert(bandraStores.data.length >= 1, `Filtered stores by area (Bandra): ${bandraStores.data.length} found`);

    const productsRes = await axios.get(`${BASE_URL}/products`);
    assert(Array.isArray(productsRes.data) && productsRes.data.length >= 40, `Found ${productsRes.data.length} products`);

    const menProducts = await axios.get(`${BASE_URL}/products?category=Men`);
    assert(menProducts.data.length > 0 && menProducts.data.every((p: any) => p.category === 'Men'), 'Category filter (Men) returns valid products');

    const singleProduct = productsRes.data[0];
    const productDetailRes = await axios.get(`${BASE_URL}/products/${singleProduct._id}`);
    assert(productDetailRes.data._id === singleProduct._id && productDetailRes.data.sizes.length > 0, `Single product API returns ${productDetailRes.data.name} with sizes`);

    // -------------------------------------------------------------
    // 2. AUTHENTICATION & LOGIN
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Authentication ---');
    // Customer Login
    const custLoginRes = await axios.post(`${BASE_URL}/auth/customer/login`, {
      email: 'demo.customer@nearstyle.com',
      password: 'Demo@123',
    });
    assert(custLoginRes.data.token && custLoginRes.data.user.role === 'CUSTOMER', 'Demo Customer login successful');
    const custToken = custLoginRes.data.token;
    const custAuthHeader = { headers: { Authorization: `Bearer ${custToken}` } };

    // Shopkeeper Login
    const skLoginRes = await axios.post(`${BASE_URL}/auth/shopkeeper/login`, {
      email: 'demo.shopkeeper@nearstyle.com',
      password: 'Demo@123',
    });
    assert(skLoginRes.data.token && skLoginRes.data.user.role === 'SHOPKEEPER', 'Demo Shopkeeper login successful');
    const skToken = skLoginRes.data.token;
    const skAuthHeader = { headers: { Authorization: `Bearer ${skToken}` } };

    // Admin Login
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/admin/login`, {
      email: 'demo.admin@nearstyle.com',
      password: 'Demo@123',
    });
    assert(adminLoginRes.data.token && adminLoginRes.data.user.role === 'ADMIN', 'Demo Admin login successful');
    const adminToken = adminLoginRes.data.token;
    const adminAuthHeader = { headers: { Authorization: `Bearer ${adminToken}` } };

    // Verify /me
    const meRes = await axios.get(`${BASE_URL}/auth/me`, custAuthHeader);
    assert(meRes.data.user?.email === 'demo.customer@nearstyle.com', 'Current user /me returns customer profile');

    // -------------------------------------------------------------
    // 3. RESERVE & TRY WORKFLOW
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Reserve & Try Workflow ---');
    // Find an item with available stock >= 2 at Fashion Hub
    const fashionHubStore = storesRes.data.find((s: any) => s.name === 'Fashion Hub');
    assert(!!fashionHubStore, 'Found Fashion Hub store');

    const hubProducts = await axios.get(`${BASE_URL}/products?storeId=${fashionHubStore._id}`);
    const targetProduct = hubProducts.data.find((p: any) => p.sizes.some((s: any) => s.quantity - (s.reserved || 0) >= 2));
    assert(!!targetProduct, `Selected target product: ${targetProduct?.name}`);

    const targetSize = targetProduct.sizes.find((s: any) => s.quantity - (s.reserved || 0) >= 2);
    const initialReserved = targetSize.reserved || 0;

    // Customer creates reservation
    const reserveRes = await axios.post(
      `${BASE_URL}/reservations`,
      {
        productId: targetProduct._id,
        size: targetSize.size,
        colour: targetProduct.colors[0] || 'Black',
      },
      custAuthHeader
    );
    assert(reserveRes.status === 201 && reserveRes.data.reservation.reservationCode.startsWith('NS-RES-'), `Reservation created with code: ${reserveRes.data.reservation.reservationCode}`);

    const resCode = reserveRes.data.reservation.reservationCode;
    const reservationId = reserveRes.data.reservation._id;

    // Verify stock locked
    const afterReserveProd = await axios.get(`${BASE_URL}/products/${targetProduct._id}`);
    const sizeAfterReserve = afterReserveProd.data.sizes.find((s: any) => s.size === targetSize.size);
    assert(sizeAfterReserve.reserved === initialReserved + 1, `Inventory lock: reserved increased from ${initialReserved} to ${sizeAfterReserve.reserved}`);

    // Shopkeeper verifies code
    const verifyRes = await axios.post(`${BASE_URL}/reservations/verify`, { code: resCode }, skAuthHeader);
    assert(verifyRes.data.reservationCode === resCode, `Shopkeeper successfully verified code ${resCode}`);

    // Customer cancels reservation
    const cancelRes = await axios.post(`${BASE_URL}/reservations/${reservationId}/cancel`, {}, custAuthHeader);
    assert(cancelRes.data.reservation.status === 'CANCELLED', 'Customer cancelled reservation');

    // Verify stock unlocked
    const afterCancelProd = await axios.get(`${BASE_URL}/products/${targetProduct._id}`);
    const sizeAfterCancel = afterCancelProd.data.sizes.find((s: any) => s.size === targetSize.size);
    assert(sizeAfterCancel.reserved === initialReserved, `Inventory unlock: reserved restored to ${sizeAfterCancel.reserved}`);

    // Customer re-reserves to test in-store purchase
    const reReserveRes = await axios.post(
      `${BASE_URL}/reservations`,
      {
        productId: targetProduct._id,
        size: targetSize.size,
        colour: targetProduct.colors[0] || 'Black',
      },
      custAuthHeader
    );
    const purchaseResId = reReserveRes.data.reservation._id;
    const initialTotalQty = sizeAfterCancel.quantity;

    // Shopkeeper marks as purchased in-store
    const purchaseRes = await axios.post(`${BASE_URL}/reservations/${purchaseResId}/purchase`, {}, skAuthHeader);
    assert(purchaseRes.data.reservation.status === 'COMPLETED', 'Shopkeeper marked reservation as purchased');

    const afterPurchaseProd = await axios.get(`${BASE_URL}/products/${targetProduct._id}`);
    const sizeAfterPurchase = afterPurchaseProd.data.sizes.find((s: any) => s.size === targetSize.size);
    assert(sizeAfterPurchase.quantity === initialTotalQty - 1, `Stock decremented: quantity went from ${initialTotalQty} to ${sizeAfterPurchase.quantity}`);

    // -------------------------------------------------------------
    // 4. CART & ORDERS WORKFLOW
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Orders & Return Workflow ---');
    const orderItemProduct = hubProducts.data[1];
    const orderSize = orderItemProduct.sizes[0].size;

    const orderPayload = {
      items: [
        {
          productId: orderItemProduct._id,
          name: orderItemProduct.name,
          size: orderSize,
          colour: orderItemProduct.colors[0] || 'Default',
          quantity: 1,
        },
      ],
      shippingAddress: {
        fullName: 'Aditi Sharma',
        phone: '+91 98765 43210',
        street: 'Flat 402, Sea Green Apts',
        city: 'Mumbai',
        area: 'Bandra',
        pincode: '400050',
      },
      orderType: 'HOME_DELIVERY',
      paymentMethod: 'DEMO_PAYMENT',
    };

    const newOrderRes = await axios.post(`${BASE_URL}/orders`, orderPayload, custAuthHeader);
    assert(newOrderRes.status === 201 && newOrderRes.data.order.orderNumber.startsWith('NS-ORD-'), `Order placed: #${newOrderRes.data.order.orderNumber}`);
    const orderId = newOrderRes.data.order._id;

    // Shopkeeper updates status to CONFIRMED, READY, DELIVERED
    await axios.put(`${BASE_URL}/orders/${orderId}/status`, { status: 'CONFIRMED' }, skAuthHeader);
    await axios.put(`${BASE_URL}/orders/${orderId}/status`, { status: 'READY' }, skAuthHeader);
    const deliveredRes = await axios.put(`${BASE_URL}/orders/${orderId}/status`, { status: 'DELIVERED' }, skAuthHeader);
    assert(deliveredRes.data.order.orderStatus === 'DELIVERED', 'Shopkeeper transitioned order to DELIVERED');

    // Customer requests return on delivered order
    const returnReqRes = await axios.post(
      `${BASE_URL}/orders/${orderId}/return`,
      { reason: 'Size did not fit as expected', notes: 'Would prefer next size up' },
      custAuthHeader
    );
    assert(returnReqRes.data.order.orderStatus === 'RETURN_REQUESTED', 'Customer successfully requested return');

    // Shopkeeper approves return
    const approveReturnRes = await axios.put(`${BASE_URL}/orders/${orderId}/return-status`, { status: 'APPROVED' }, skAuthHeader);
    assert(approveReturnRes.data.order.returnDetails.status === 'APPROVED', 'Shopkeeper approved return request');

    // -------------------------------------------------------------
    // 5. SHOPKEEPER INVENTORY MANAGEMENT
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Shopkeeper Inventory Controls ---');
    const initialQty = sizeAfterPurchase.quantity;
    // Increment stock by +5
    const incRes = await axios.patch(
      `${BASE_URL}/inventory/${targetProduct._id}/size`,
      { size: targetSize.size, delta: 5 },
      skAuthHeader
    );
    const updatedSize = incRes.data.sizes.find((s: any) => s.size === targetSize.size);
    assert(updatedSize.quantity === initialQty + 5, `Quick stock [+]: quantity increased to ${updatedSize.quantity}`);

    // Decrement stock by -2
    const decRes = await axios.patch(
      `${BASE_URL}/inventory/${targetProduct._id}/size`,
      { size: targetSize.size, delta: -2 },
      skAuthHeader
    );
    const decSize = decRes.data.sizes.find((s: any) => s.size === targetSize.size);
    assert(decSize.quantity === initialQty + 3, `Quick stock [-]: quantity decreased to ${decSize.quantity}`);

    // Low stock endpoint
    const lowStockRes = await axios.get(`${BASE_URL}/inventory/low-stock`, skAuthHeader);
    assert(Array.isArray(lowStockRes.data), `Low stock items retrieved (${lowStockRes.data.length} items flagged)`);

    // Shopkeeper Analytics & Trends
    const analyticsRes = await axios.get(`${BASE_URL}/analytics/shopkeeper`, skAuthHeader);
    assert(analyticsRes.data.metrics !== undefined, 'Shopkeeper analytics returned metrics and figures');

    const trendsRes = await axios.get(`${BASE_URL}/analytics/trends`);
    assert(trendsRes.data.popularCategories !== undefined, 'Platform trends returned trending categories');

    // -------------------------------------------------------------
    // 6. WISHLIST & REVIEWS
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Wishlist & Reviews ---');
    // Ensure clean wishlist slate
    const initWish = await axios.get(`${BASE_URL}/wishlist`, custAuthHeader);
    if (Array.isArray(initWish.data) && initWish.data.some((p: any) => p._id?.toString() === targetProduct._id.toString())) {
      await axios.post(`${BASE_URL}/wishlist/toggle`, { productId: targetProduct._id }, custAuthHeader);
    }

    // Add to wishlist
    const wishRes = await axios.post(`${BASE_URL}/wishlist/toggle`, { productId: targetProduct._id }, custAuthHeader);
    assert(wishRes.data.added === true, 'Added product to wishlist');

    const myWishlist = await axios.get(`${BASE_URL}/wishlist`, custAuthHeader);
    assert(Array.isArray(myWishlist.data) && myWishlist.data.some((p: any) => p._id?.toString() === targetProduct._id.toString()), 'Wishlist contains product');

    // Remove from wishlist
    const unwishRes = await axios.post(`${BASE_URL}/wishlist/toggle`, { productId: targetProduct._id }, custAuthHeader);
    assert(unwishRes.data.added === false, 'Removed product from wishlist');

    // Post review
    try {
      const reviewRes = await axios.post(
        `${BASE_URL}/reviews`,
        {
          productId: targetProduct._id,
          rating: 5,
          comment: 'Outstanding quality and very smooth reservation experience!',
        },
        custAuthHeader
      );
      assert(reviewRes.status === 201 && reviewRes.data.review.rating === 5, 'Customer review posted successfully');
    } catch (revErr: any) {
      if (revErr.response?.data?.message?.includes('already reviewed')) {
        assert(true, 'Duplicate review guard verified: blocked duplicate review as expected');
      } else {
        throw revErr;
      }
    }

    // -------------------------------------------------------------
    // 7. ADMIN MANAGEMENT
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Admin Endpoints ---');
    const adminMetrics = await axios.get(`${BASE_URL}/admin/metrics`, adminAuthHeader);
    assert(adminMetrics.data.totalStores >= 6 && adminMetrics.data.totalProducts >= 40, `Admin metrics: ${adminMetrics.data.totalStores} stores, ${adminMetrics.data.totalProducts} products, ₹${adminMetrics.data.grossRevenue} gross revenue`);

    const adminStores = await axios.get(`${BASE_URL}/admin/stores`, adminAuthHeader);
    assert(adminStores.data.length >= 6, `Admin store list returned ${adminStores.data.length} stores`);

    const adminUsers = await axios.get(`${BASE_URL}/admin/users`, adminAuthHeader);
    assert(adminUsers.data.length >= 3, `Admin user list returned ${adminUsers.data.length} users`);

    // -------------------------------------------------------------
    // 8. SECURITY & ROLE GUARDS
    // -------------------------------------------------------------
    console.log('\n--- 8. Testing Security & Role-Based Access Guards ---');
    try {
      await axios.get(`${BASE_URL}/admin/metrics`, custAuthHeader);
      assert(false, 'Customer was blocked from admin endpoint');
    } catch (e: any) {
      assert(e.response?.status === 403, 'Customer correctly forbidden (403) from admin endpoint');
    }

    try {
      await axios.patch(`${BASE_URL}/inventory/${targetProduct._id}/size`, { size: 'M', delta: 1 }, custAuthHeader);
      assert(false, 'Customer was blocked from shopkeeper inventory endpoint');
    } catch (e: any) {
      assert(e.response?.status === 403, 'Customer correctly forbidden (403) from shopkeeper inventory endpoint');
    }

    try {
      await axios.get(`${BASE_URL}/orders/my`); // No token
      assert(false, 'Unauthenticated request was blocked');
    } catch (e: any) {
      assert(e.response?.status === 401, 'Unauthenticated request correctly rejected with 401');
    }

    console.log('\n====================================================');
    console.log(`🎯 END-TO-END TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Test execution failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testFullJourney();
