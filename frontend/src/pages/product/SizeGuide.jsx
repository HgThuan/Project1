import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import './SizeGuide.css';

export default function SizeGuide() {
    const [activeTab, setActiveTab] = useState('tops');
    const [unit, setUnit] = useState('cm'); // 'cm' or 'inches'
    const [measurements, setMeasurements] = useState({
        chest: '',
        waist: '',
        hips: '',
        height: ''
    });
    const [recommendedSize, setRecommendedSize] = useState('');

    // Size chart data for different categories
    const sizeCharts = {
        tops: {
            title: 'Bảng size áo',
            headers: ['Size', 'Ngực (cm)', 'Eo (cm)', 'Vai (cm)', 'Dài áo (cm)'],
            rows: [
                ['S', '88-92', '74-78', '42', '68'],
                ['M', '92-96', '78-82', '44', '70'],
                ['L', '96-100', '82-86', '46', '72'],
                ['XL', '100-104', '86-90', '48', '74'],
                ['2XL', '104-108', '90-94', '50', '76']
            ]
        },
        bottoms: {
            title: 'Bảng size quần',
            headers: ['Size', 'Eo (cm)', 'Mông (cm)', 'Dài quần (cm)', 'Cân nặng (kg)'],
            rows: [
                ['S', '74-78', '88-92', '98', '50-60'],
                ['M', '78-82', '92-96', '100', '60-70'],
                ['L', '82-86', '96-100', '102', '70-80'],
                ['XL', '86-90', '100-104', '104', '80-90'],
                ['2XL', '90-94', '104-108', '106', '90-100']
            ]
        },
        shoes: {
            title: 'Bảng size giày',
            headers: ['Size VN', 'Size US', 'Size EU', 'Chiều dài chân (cm)'],
            rows: [
                ['37', '6', '38', '23.5'],
                ['38', '7', '39', '24.0'],
                ['39', '8', '40', '24.5'],
                ['40', '9', '41', '25.0'],
                ['41', '10', '42', '25.5'],
                ['42', '11', '43', '26.0'],
                ['43', '12', '44', '26.5']
            ]
        },
        kids: {
            title: 'Bảng size trẻ em',
            headers: ['Tuổi', 'Chiều cao (cm)', 'Cân nặng (kg)', 'Size'],
            rows: [
                ['2-3', '90-100', '13-15', 'S'],
                ['4-5', '100-110', '15-18', 'M'],
                ['6-7', '110-120', '18-22', 'L'],
                ['8-9', '120-130', '22-26', 'XL'],
                ['10-12', '130-145', '26-35', '2XL']
            ]
        }
    };

    const cmToInches = (cm) => (cm * 0.393701).toFixed(1);
    const inchesToCm = (inches) => (inches * 2.54).toFixed(1);

    const handleMeasurementChange = (field, value) => {
        setMeasurements(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const calculateSize = () => {
        const { chest, waist, hips } = measurements;

        if (!chest || !waist) {
            alert('Vui lòng nhập ít nhất số đo ngực và eo');
            return;
        }

        // Convert to cm if in inches
        const chestCm = unit === 'inches' ? inchesToCm(parseFloat(chest)) : parseFloat(chest);
        const waistCm = unit === 'inches' ? inchesToCm(parseFloat(waist)) : parseFloat(waist);

        let size = '';

        if (activeTab === 'tops') {
            if (chestCm <= 92 && waistCm <= 78) size = 'S';
            else if (chestCm <= 96 && waistCm <= 82) size = 'M';
            else if (chestCm <= 100 && waistCm <= 86) size = 'L';
            else if (chestCm <= 104 && waistCm <= 90) size = 'XL';
            else size = '2XL';
        } else if (activeTab === 'bottoms') {
            if (waistCm <= 78) size = 'S';
            else if (waistCm <= 82) size = 'M';
            else if (waistCm <= 86) size = 'L';
            else if (waistCm <= 90) size = 'XL';
            else size = '2XL';
        }

        setRecommendedSize(size);
    };

    const convertValue = (value) => {
        if (!value) return '';
        const numValue = parseFloat(value);
        if (unit === 'cm') {
            return cmToInches(numValue);
        }
        return inchesToCm(numValue);
    };

    const toggleUnit = () => {
        const newUnit = unit === 'cm' ? 'inches' : 'cm';

        // Convert existing measurements
        const newMeasurements = {};
        Object.keys(measurements).forEach(key => {
            if (measurements[key]) {
                newMeasurements[key] = convertValue(measurements[key]);
            } else {
                newMeasurements[key] = '';
            }
        });

        setMeasurements(newMeasurements);
        setUnit(newUnit);
    };

    const tabs = [
        { id: 'tops', label: 'Áo', icon: '👕' },
        { id: 'bottoms', label: 'Quần', icon: '👖' },
        { id: 'shoes', label: 'Giày', icon: '👟' },
        { id: 'kids', label: 'Trẻ em', icon: '👶' }
    ];

    return (
        <Fragment>
            <main className="size-guide-page">
                <div className="container1">
                    {/* Breadcrumb */}
                    <div className="link-page" style={{ marginBottom: '30px' }}>
                        <Link to="/" className="link-page__homepage">Trang chủ</Link>
                        <span>/</span>
                        <span className="link-page__currentPage">Hướng dẫn chọn size</span>
                    </div>

                    {/* Header */}
                    <div className="size-guide__header">
                        <h1>Hướng Dẫn Chọn Size</h1>
                        <p>Tìm size hoàn hảo cho bạn với công cụ tính toán thông minh của chúng tôi</p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="size-guide__tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`size-guide__tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setRecommendedSize('');
                                }}
                            >
                                <span className="tab-icon">{tab.icon}</span>
                                <span className="tab-label">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="size-guide__content">
                        {/* Size Calculator */}
                        {(activeTab === 'tops' || activeTab === 'bottoms') && (
                            <div className="size-calculator">
                                <div className="size-calculator__header">
                                    <h2>
                                        <i className="fa-solid fa-calculator"></i>
                                        Tính toán size của bạn
                                    </h2>
                                    <button className="unit-toggle" onClick={toggleUnit}>
                                        <i className="fa-solid fa-arrows-rotate"></i>
                                        {unit === 'cm' ? 'Chuyển sang inches' : 'Chuyển sang cm'}
                                    </button>
                                </div>

                                <div className="size-calculator__inputs">
                                    <div className="input-group">
                                        <label htmlFor="chest">
                                            <i className="fa-solid fa-user"></i>
                                            Vòng ngực
                                        </label>
                                        <div className="input-with-unit">
                                            <input
                                                id="chest"
                                                type="number"
                                                placeholder="Nhập số đo"
                                                value={measurements.chest}
                                                onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                                            />
                                            <span className="unit">{unit}</span>
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="waist">
                                            <i className="fa-solid fa-user"></i>
                                            Vòng eo
                                        </label>
                                        <div className="input-with-unit">
                                            <input
                                                id="waist"
                                                type="number"
                                                placeholder="Nhập số đo"
                                                value={measurements.waist}
                                                onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                                            />
                                            <span className="unit">{unit}</span>
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="hips">
                                            <i className="fa-solid fa-user"></i>
                                            Vòng mông
                                        </label>
                                        <div className="input-with-unit">
                                            <input
                                                id="hips"
                                                type="number"
                                                placeholder="Nhập số đo"
                                                value={measurements.hips}
                                                onChange={(e) => handleMeasurementChange('hips', e.target.value)}
                                            />
                                            <span className="unit">{unit}</span>
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="height">
                                            <i className="fa-solid fa-arrows-up-down"></i>
                                            Chiều cao
                                        </label>
                                        <div className="input-with-unit">
                                            <input
                                                id="height"
                                                type="number"
                                                placeholder="Nhập chiều cao"
                                                value={measurements.height}
                                                onChange={(e) => handleMeasurementChange('height', e.target.value)}
                                            />
                                            <span className="unit">{unit}</span>
                                        </div>
                                    </div>
                                </div>

                                <button className="size-calculator__btn" onClick={calculateSize}>
                                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                                    Tính toán size
                                </button>

                                {recommendedSize && (
                                    <div className="size-recommendation">
                                        <i className="fa-solid fa-circle-check"></i>
                                        <div>
                                            <p className="recommendation-label">Size phù hợp với bạn:</p>
                                            <p className="recommendation-size">{recommendedSize}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Size Chart Table */}
                        <div className="size-chart-section">
                            <h2>
                                <i className="fa-solid fa-table"></i>
                                {sizeCharts[activeTab].title}
                            </h2>

                            <div className="size-chart-table-wrapper">
                                <table className="size-chart-table">
                                    <thead>
                                        <tr>
                                            {sizeCharts[activeTab].headers.map((header, index) => (
                                                <th key={index}>{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sizeCharts[activeTab].rows.map((row, rowIndex) => (
                                            <tr key={rowIndex} className={recommendedSize === row[0] ? 'highlighted' : ''}>
                                                {row.map((cell, cellIndex) => (
                                                    <td key={cellIndex}>{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Measurement Guide */}
                        <div className="measurement-guide">
                            <h2>
                                <i className="fa-solid fa-book-open"></i>
                                Cách đo cơ thể chính xác
                            </h2>

                            <div className="measurement-tips">
                                <div className="measurement-tip">
                                    <div className="tip-icon">
                                        <i className="fa-solid fa-1"></i>
                                    </div>
                                    <div className="tip-content">
                                        <h3>Vòng ngực</h3>
                                        <p>Đo quanh phần rộng nhất của ngực, giữ thước ngang và vừa khít</p>
                                    </div>
                                </div>

                                <div className="measurement-tip">
                                    <div className="tip-icon">
                                        <i className="fa-solid fa-2"></i>
                                    </div>
                                    <div className="tip-content">
                                        <h3>Vòng eo</h3>
                                        <p>Đo quanh phần nhỏ nhất của eo, thường ở trên rốn khoảng 2-3cm</p>
                                    </div>
                                </div>

                                <div className="measurement-tip">
                                    <div className="tip-icon">
                                        <i className="fa-solid fa-3"></i>
                                    </div>
                                    <div className="tip-content">
                                        <h3>Vòng mông</h3>
                                        <p>Đo quanh phần rộng nhất của mông, đứng thẳng và chân khép lại</p>
                                    </div>
                                </div>

                                <div className="measurement-tip">
                                    <div className="tip-icon">
                                        <i className="fa-solid fa-4"></i>
                                    </div>
                                    <div className="tip-content">
                                        <h3>Chiều cao</h3>
                                        <p>Đứng thẳng, tuyệt, lưng dựa vào tường và đo từ đỉnh đầu đến chân</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tips Section */}
                        <div className="size-guide-tips">
                            <h2>
                                <i className="fa-solid fa-lightbulb"></i>
                                Lưu ý khi chọn size
                            </h2>
                            <ul>
                                <li>
                                    <i className="fa-solid fa-check"></i>
                                    Nếu số đo của bạn nằm giữa 2 size, chọn size lớn hơn để thoải mái hơn
                                </li>
                                <li>
                                    <i className="fa-solid fa-check"></i>
                                    Với áo form rộng oversized, có thể chọn size nhỏ hơn 1 size so với thông thường
                                </li>
                                <li>
                                    <i className="fa-solid fa-check"></i>
                                    Đo cơ thể vào buổi sáng để có kết quả chính xác nhất
                                </li>
                                <li>
                                    <i className="fa-solid fa-check"></i>
                                    Nên nhờ người khác hỗ trợ đo để đảm bảo chính xác
                                </li>
                                <li>
                                    <i className="fa-solid fa-check"></i>
                                    Tham khảo phần đánh giá của khách hàng về độ vừa vặn của sản phẩm
                                </li>
                            </ul>
                        </div>

                        {/* Help Section */}
                        <div className="size-guide-help">
                            <div className="help-icon">
                                <i className="fa-solid fa-headset"></i>
                            </div>
                            <div className="help-content">
                                <h3>Cần hỗ trợ thêm?</h3>
                                <p>Liên hệ với chúng tôi qua hotline <strong>1900.27.27.37</strong> hoặc chat trực tuyến để được tư vấn size phù hợp nhất</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </Fragment>
    );
}
