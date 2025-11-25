# Invoice Management API Documentation

## Base URL
```
http://localhost:5001
```

## Endpoints

### 1. Get All Invoices (List with Filtering)

**Endpoint:** `GET /api/invoices`

**Description:** Retrieve invoices with pagination, search, and multiple filter options.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `limit` | integer | 10 | Number of items per page |
| `search` | string | - | Search by invoice ID, customer name, or phone |
| `paymentStatus` | string | - | Filter by: `Chưa thanh toán`, `Đã thanh toán`, `Đã hoàn tiền` |
| `paymentMethod` | string | - | Filter by: `Tiền mặt`, `Chuyển khoản`, `Ví điện tử`, `COD` |
| `status` | string | - | Filter by: `Hoạt động`, `Đã hủy` |
| `createdType` | string | - | Filter by: `Auto`, `Manual` |
| `startDate` | string (date) | - | Filter from this date (YYYY-MM-DD) |
| `endDate` | string (date) | - | Filter to this date (YYYY-MM-DD) |

**Example Requests:**

```bash
# Get first page with default limit
GET /api/invoices

# Search for invoices containing "Nguyen"
GET /api/invoices?search=Nguyen

# Filter paid invoices
GET /api/invoices?paymentStatus=Đã%20thanh%20toán

# Filter by date range
GET /api/invoices?startDate=2025-11-01&endDate=2025-11-30

# Filter auto-generated invoices only
GET /api/invoices?createdType=Auto

# Combine multiple filters
GET /api/invoices?page=2&limit=20&paymentStatus=Chưa%20thanh%20toán&createdType=Manual
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "invoices": [
    {
      "_id": "69242a8f5d2dfd67e28f30b8",
      "ma_hoa_don": "HD2511240001",
      "orderId": null,
      "ma_don_hang": null,
      "customerInfo": {
        "name": "Nguyễn Văn A",
        "phone": "0987654321",
        "address": "123 Test Street, HCM",
        "email": "test@example.com"
      },
      "products": [
        {
          "product_id": "SP001",
          "name": "Áo Thun Nam",
          "quantity": 2,
          "price": 200000,
          "tax": 20000,
          "discount": 10000,
          "color": "Đỏ",
          "size": "L",
          "image": ""
        }
      ],
      "financials": {
        "subtotal": 400000,
        "totalTax": 40000,
        "totalDiscount": 20000,
        "finalAmount": 420000
      },
      "paymentStatus": "Đã thanh toán",
      "paymentMethod": "Tiền mặt",
      "logs": [...],
      "createdType": "Manual",
      "status": "Hoạt động",
      "createdAt": "2025-11-24T09:51:11.825Z",
      "updatedAt": "2025-11-24T09:51:11.825Z"
    }
  ],
  "totalInvoices": 15,
  "totalPages": 2,
  "currentPage": 1
}
```

---

### 2. Get Invoice by ID

**Endpoint:** `GET /api/invoices/:id`

**Description:** Retrieve detailed information for a specific invoice.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Invoice ID (ma_hoa_don) |

**Example Request:**

```bash
GET /api/invoices/HD2511240001
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "invoice": {
    "_id": "69242a8f5d2dfd67e28f30b8",
    "ma_hoa_don": "HD2511240001",
    "orderId": {
      "_id": "69242a905d2dfd67e28f30d1",
      "ma_don_hang": "DH2511246281",
      "trang_thai": 2,
      "ten_khach": "Test Customer",
      "dia_chi": "Address",
      "sdt": "0123456789"
    },
    "ma_don_hang": "DH2511246281",
    "customerInfo": { ... },
    "products": [ ... ],
    "financials": { ... },
    "paymentStatus": "Đã thanh toán",
    "paymentMethod": "Chuyển khoản",
    "logs": [
      {
        "timestamp": "2025-11-24T09:51:11.818Z",
        "action": "created",
        "note": "Tạo hóa đơn thủ công",
        "performedBy": "admin123"
      }
    ],
    "createdType": "Manual",
    "status": "Hoạt động",
    "createdAt": "2025-11-24T09:51:11.825Z",
    "updatedAt": "2025-11-24T09:51:11.825Z"
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "message": "Không tìm thấy hóa đơn"
}
```

---

### 3. Create Manual Invoice

**Endpoint:** `POST /api/invoices`

**Description:** Create a new invoice manually (for offline sales).

**Request Body:**

```json
{
  "customerInfo": {
    "name": "Nguyễn Văn B",           // Required
    "phone": "0987654321",             // Required
    "address": "123 Street, HCM",      // Required
    "email": "customer@example.com"    // Optional
  },
  "products": [                        // Required, cannot be empty
    {
      "product_id": "SP001",
      "name": "Áo Thun",
      "quantity": 2,
      "price": 200000,
      "tax": 20000,                    // Optional, default: 0
      "discount": 10000,               // Optional, default: 0
      "color": "Đỏ",                   // Optional
      "size": "L",                     // Optional
      "image": "url"                   // Optional
    }
  ],
  "paymentMethod": "Tiền mặt",         // Optional, default: "COD"
                                        // Options: "Tiền mặt", "Chuyển khoản", "Ví điện tử", "COD"
  "paymentStatus": "Đã thanh toán",    // Optional, default: "Chưa thanh toán"
                                        // Options: "Chưa thanh toán", "Đã thanh toán"
  "notes": "Bán hàng tại cửa hàng",    // Optional
  "performedBy": "admin123"            // Optional, default: "admin"
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5001/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "name": "Nguyễn Văn B",
      "phone": "0987654321",
      "address": "123 Street, HCM"
    },
    "products": [
      {
        "product_id": "SP001",
        "name": "Áo Thun",
        "quantity": 2,
        "price": 200000
      }
    ],
    "paymentMethod": "Tiền mặt",
    "paymentStatus": "Đã thanh toán"
  }'
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Tạo hóa đơn thành công",
  "invoice": {
    "ma_hoa_don": "HD2511240003",
    "customerInfo": { ... },
    "products": [ ... ],
    "financials": {
      "subtotal": 400000,
      "totalTax": 0,
      "totalDiscount": 0,
      "finalAmount": 400000
    },
    "paymentStatus": "Đã thanh toán",
    "paymentMethod": "Tiền mặt",
    "createdType": "Manual",
    "status": "Hoạt động",
    ...
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Thông tin khách hàng không đầy đủ (tên, số điện thoại, địa chỉ)"
}
```

---

### 4. Update Invoice

**Endpoint:** `PUT /api/invoices/:id`

**Description:** Update invoice details (customer info, products, payment status/method).

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Invoice ID (ma_hoa_don) |

**Request Body (All fields optional):**

```json
{
  "customerInfo": {              // Optional: Partial update of customer info
    "name": "Updated Name",
    "phone": "0912345678"
  },
  "products": [                  // Optional: Replace all products (triggers recalculation)
    {
      "product_id": "SP002",
      "name": "New Product",
      "quantity": 1,
      "price": 300000
    }
  ],
  "paymentStatus": "Đã thanh toán",  // Optional
  "paymentMethod": "Chuyển khoản",   // Optional
  "notes": "Updated via admin panel", // Optional
  "performedBy": "admin123"           // Optional
}
```

**Example Request:**

```bash
curl -X PUT http://localhost:5001/api/invoices/HD2511240001 \
  -H "Content-Type: application/json" \
  -d '{
    "paymentStatus": "Đã thanh toán",
    "notes": "Payment received",
    "performedBy": "admin123"
  }'
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Cập nhật hóa đơn thành công",
  "invoice": {
    "ma_hoa_don": "HD2511240001",
    "paymentStatus": "Đã thanh toán",
    "logs": [
      ...,
      {
        "timestamp": "2025-11-24T10:00:00.000Z",
        "action": "updated",
        "note": "Payment received",
        "performedBy": "admin123"
      }
    ],
    ...
  }
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "success": false,
  "message": "Không tìm thấy hóa đơn"
}

// 400 Bad Request (trying to update cancelled invoice)
{
  "success": false,
  "message": "Không thể cập nhật hóa đơn đã hủy"
}
```

---

### 5. Cancel/Refund Invoice

**Endpoint:** `POST /api/invoices/cancel/:id`

**Description:** Cancel an invoice and optionally mark as refunded if it was paid.

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Invoice ID (ma_hoa_don) |

**Request Body:**

```json
{
  "reason": "Customer requested cancellation",  // Optional
  "performedBy": "admin123"                      // Optional, default: "admin"
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5001/api/invoices/cancel/HD2511240001 \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Customer requested refund",
    "performedBy": "admin123"
  }'
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Đã hủy hóa đơn thành công",
  "invoice": {
    "ma_hoa_don": "HD2511240001",
    "status": "Đã hủy",
    "paymentStatus": "Đã hoàn tiền",  // If was paid, otherwise unchanged
    "logs": [
      ...,
      {
        "timestamp": "2025-11-24T10:05:00.000Z",
        "action": "cancelled",
        "note": "Customer requested refund",
        "performedBy": "admin123"
      }
    ],
    ...
  }
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "success": false,
  "message": "Không tìm thấy hóa đơn"
}

// 400 Bad Request (already cancelled)
{
  "success": false,
  "message": "Hóa đơn đã được hủy trước đó"
}
```

---

## Automatic Invoice Generation

Invoices are **automatically generated** when an order is approved (status changes to 2 - "Đã duyệt").

### Trigger Points

1. **Via Order Status Update:**
   ```bash
   PUT /api/updateOrder/:ma_don_hang
   {
     "trang_thai": 2,
     "isAdmin": true
   }
   ```

2. **Via Order Approval Endpoint:**
   ```bash
   PUT /api/approveOrder/:ma_don_hang
   {
     "ten_khach": "Customer Name",
     "sdt": "0123456789",
     "dia_chi": "Address"
   }
   ```

### Auto-Generated Invoice Characteristics

- `createdType`: "Auto"
- `orderId`: Linked to the order ObjectId
- `ma_don_hang`: Order code for reference
- `customerInfo`: Copied from order (ten_khach, sdt, dia_chi)
- `products`: Copied from order details (CTDH)
- `paymentMethod`: Defaults to "COD"
- `paymentStatus`: Based on order's thanh_toan field
- `logs`: Includes creation note mentioning the source order

---

## Data Models

### Invoice Schema

```typescript
{
  ma_hoa_don: string,              // Auto-generated (HD + YYMMDD + counter)
  orderId: ObjectId | null,        // Reference to Order (null for manual)
  ma_don_hang: string | null,      // Order code (null for manual)
  
  customerInfo: {
    name: string,
    phone: string,
    address: string,
    email: string
  },
  
  products: [{
    product_id: string,
    name: string,
    quantity: number,
    price: number,
    tax: number,
    discount: number,
    color: string,
    size: string,
    image: string
  }],
  
  financials: {
    subtotal: number,              // Auto-calculated
    totalTax: number,              // Auto-calculated
    totalDiscount: number,         // Auto-calculated
    finalAmount: number            // Auto-calculated
  },
  
  paymentStatus: "Chưa thanh toán" | "Đã thanh toán" | "Đã hoàn tiền",
  paymentMethod: "Tiền mặt" | "Chuyển khoản" | "Ví điện tử" | "COD",
  
  logs: [{
    timestamp: Date,
    action: string,
    note: string,
    performedBy: string
  }],
  
  createdType: "Auto" | "Manual",
  status: "Hoạt động" | "Đã hủy",
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created (new invoice) |
| 400 | Bad Request (validation error, trying to update cancelled invoice, etc.) |
| 404 | Not Found (invoice doesn't exist) |
| 500 | Internal Server Error |

---

## Frontend Integration Examples

### React Component for Invoice List

```javascript
import React, { useState, useEffect } from 'react';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    search: '',
    paymentStatus: '',
    createdType: ''
  });

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const fetchInvoices = async () => {
    const params = new URLSearchParams({
      page: filters.page,
      ...(filters.search && { search: filters.search }),
      ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
      ...(filters.createdType && { createdType: filters.createdType })
    });

    const response = await fetch(`http://localhost:5001/api/invoices?${params}`);
    const data = await response.json();
    
    if (data.success) {
      setInvoices(data.invoices);
    }
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search invoices..."
        value={filters.search}
        onChange={handleSearch}
      />
      
      <select onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}>
        <option value="">All Payment Status</option>
        <option value="Chưa thanh toán">Unpaid</option>
        <option value="Đã thanh toán">Paid</option>
        <option value="Đã hoàn tiền">Refunded</option>
      </select>

      <select onChange={(e) => handleFilterChange('createdType', e.target.value)}>
        <option value="">All Types</option>
        <option value="Auto">Auto-Generated</option>
        <option value="Manual">Manual</option>
      </select>

      <table>
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Payment Status</th>
            <th>Type</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(invoice => (
            <tr key={invoice.ma_hoa_don}>
              <td>{invoice.ma_hoa_don}</td>
              <td>{invoice.customerInfo.name}</td>
              <td>{invoice.financials.finalAmount.toLocaleString()} VND</td>
              <td>{invoice.paymentStatus}</td>
              <td>{invoice.createdType}</td>
              <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## Notes

- All amounts are in VND (Vietnamese Dong)
- Timestamps are in ISO 8601 format
- Invoice IDs follow the pattern: HD + YYMMDD + sequential counter (e.g., HD2511240001)
- Financial calculations are automatic - no need to calculate on frontend
- Cancelling a paid invoice automatically marks it as refunded
- Auto-generated invoices cannot have duplicate - one invoice per order
- Updates to cancelled invoices are blocked
