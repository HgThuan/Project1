import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function Thongke() {
    const [loading, setLoading] = useState(true);
    const [dashboardStats, setDashboardStats] = useState({
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        pendingInvoices: 0
    });
    const [invoiceStats, setInvoiceStats] = useState({
        revenueOverTime: [],
        invoicesByStatus: [],
        revenueByPaymentMethod: [],
        summary: {
            totalOutstanding: { amount: 0, count: 0 },
            totalRefunded: { amount: 0, count: 0 },
            totalPaid: { amount: 0, count: 0 },
            totalInvoices: 0
        }
    });

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            // Fetch dashboard stats
            const dashboardRes = await axios.get('http://localhost:5001/api/stats/dashboard');
            setDashboardStats(dashboardRes.data.data);

            // Fetch invoice stats
            const invoiceRes = await axios.get('http://localhost:5001/api/stats/invoices?period=month');
            setInvoiceStats(invoiceRes.data.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Prepare Line Chart Data for Revenue Over Time
    const revenueChartData = {
        labels: invoiceStats.revenueOverTime.map(item => {
            const date = new Date(item._id + '-01');
            return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
        }),
        datasets: [
            {
                label: 'Doanh thu đã thanh toán',
                data: invoiceStats.revenueOverTime.map(item => item.paidRevenue),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            },
            {
                label: 'Doanh thu chưa thanh toán',
                data: invoiceStats.revenueOverTime.map(item => item.unpaidRevenue),
                borderColor: 'rgb(255, 206, 86)',
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                tension: 0.1
            }
        ]
    };

    const revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Doanh thu theo thời gian (12 tháng gần nhất)'
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += formatCurrency(context.parsed.y);
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return (value / 1000000).toFixed(1) + 'M';
                    }
                }
            }
        }
    };

    // Prepare Pie Chart Data for Payment Method Distribution
    const paymentMethodColors = {
        'Tiền mặt': 'rgba(255, 99, 132, 0.8)',
        'Chuyển khoản': 'rgba(54, 162, 235, 0.8)',
        'Ví điện tử': 'rgba(255, 206, 86, 0.8)',
        'COD': 'rgba(75, 192, 192, 0.8)'
    };

    const paymentMethodChartData = {
        labels: invoiceStats.revenueByPaymentMethod.map(item => item._id),
        datasets: [
            {
                label: 'Doanh thu',
                data: invoiceStats.revenueByPaymentMethod.map(item => item.revenue),
                backgroundColor: invoiceStats.revenueByPaymentMethod.map(item =>
                    paymentMethodColors[item._id] || 'rgba(153, 102, 255, 0.8)'
                ),
                borderWidth: 1
            }
        ]
    };

    const paymentMethodChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Phân bố doanh thu theo phương thức thanh toán'
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = formatCurrency(context.parsed);
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    return (
        <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Thống kê</h1>
                <button
                    onClick={fetchStatistics}
                    className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"
                >
                    <i className="fas fa-sync fa-sm text-white-50"></i> Làm mới
                </button>
            </div>

            {/* Summary Cards Row 1 */}
            <div className="row">
                {/* Monthly Revenue Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Doanh thu (Tháng này)
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {formatCurrency(dashboardStats.monthlyRevenue)}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-calendar fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Yearly Revenue Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-success shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Doanh thu (Năm nay)
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {formatCurrency(dashboardStats.yearlyRevenue)}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Outstanding Amount Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-warning shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Chưa thanh toán
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {formatCurrency(invoiceStats.summary.totalOutstanding.amount)}
                                    </div>
                                    <div className="text-xs text-muted">
                                        {invoiceStats.summary.totalOutstanding.count} hóa đơn
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-exclamation-circle fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Refunded Amount Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-danger shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                                        Đã hoàn tiền
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {formatCurrency(invoiceStats.summary.totalRefunded.amount)}
                                    </div>
                                    <div className="text-xs text-muted">
                                        {invoiceStats.summary.totalRefunded.count} hóa đơn
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-undo fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="row">
                {/* Revenue Over Time Chart */}
                <div className="col-xl-8 col-lg-7 mb-4">
                    <div className="card shadow">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Biểu đồ doanh thu</h6>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Đang tải...</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ height: '300px' }}>
                                    <Line data={revenueChartData} options={revenueChartOptions} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment Method Distribution Chart */}
                <div className="col-xl-4 col-lg-5 mb-4">
                    <div className="card shadow">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Phương thức thanh toán</h6>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Đang tải...</span>
                                    </div>
                                </div>
                            ) : invoiceStats.revenueByPaymentMethod.length > 0 ? (
                                <div style={{ height: '300px' }}>
                                    <Pie data={paymentMethodChartData} options={paymentMethodChartOptions} />
                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <p>Chưa có dữ liệu</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Stats Row */}
            <div className="row">
                <div className="col-xl-12 mb-4">
                    <div className="card shadow">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Thống kê hóa đơn</h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {invoiceStats.invoicesByStatus.map((status, idx) => (
                                    <div key={idx} className="col-md-4 mb-3">
                                        <div className="border-left-info p-3" style={{ borderLeft: '4px solid #36b9cc' }}>
                                            <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                                {status._id}
                                            </div>
                                            <div className="h6 mb-0 font-weight-bold text-gray-800">
                                                {status.count} hóa đơn
                                            </div>
                                            <div className="text-sm text-muted">
                                                Tổng: {formatCurrency(status.totalAmount)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
