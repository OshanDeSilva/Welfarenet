import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar, TrendingUp, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import { useRef } from "react";
import axios from '../../config'

const ReportsGenerator = () => {

  const reportRef = useRef();

  const token = localStorage.getItem('token');
  const currentYear = new Date().getFullYear();

  const [reportType, setReportType] = useState('annual');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [startMonth, setStartMonth] = useState(0);
  const [endMonth, setEndMonth] = useState(11);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [eventReportData, setEventReportData] = useState(null);
  const [annualIncomeData, setAnnualIncomeData] = useState([]);
  const [annualExpenseData, setAnnualExpenseData] = useState([]);
  const [isEventReportsLoading, setIsEventReportsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [eventsList, setEventsList] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const normalizeMonthName = (monthName) => {
    if (!monthName) return '';
    return monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
  };

  const fetchAnnualIncomeData = async () => {
    try {
      const response = await axios.get('/reports/annual-income', {
        params: { year: selectedYear },
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      console.log('Annual Income Data : ', response.data);
      const normalizedData = response.data.map(item => ({ ...item, month: normalizeMonthName(item.month) }));
      setAnnualIncomeData(normalizedData);
    } catch (error) {
      console.log('Error occurred while fetching annual income', error);
      setAnnualIncomeData([]);
    }
  }

  const fetchAnnualExpenseData = async () => {
    try {
      const response = await axios.get('/reports/annual-expenses', {
        params: { year: selectedYear },
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      console.log('Annual Expense Data : ', response.data);
      const normalizedData = response.data.map(item => ({ ...item, month: normalizeMonthName(item.month) }));
      setAnnualExpenseData(normalizedData);
    } catch (error) {
      console.log('Error occurred while fetching Annual expenses', error);
      setAnnualExpenseData([]);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAnnualIncomeData(), fetchAnnualExpenseData()]);
      setIsLoading(false);
    };
    fetchData();
  }, [selectedYear]);

  const fetchEventsList = async () => {
    try {
      const response = await axios.get('/events/getAll', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      console.log('Events List : ', response.data);
      setEventsList(response.data);
      setIsEventReportsLoading(false);
    } catch (error) {
      console.log('Error occurred while fetching events list', error);
      setIsEventReportsLoading(false);
    }
  }

  const fetchEventIncome = async (eventId) => {
    try {
      const response = await axios.get(`/reports/event-income/${eventId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      console.log('Event Income Data : ', response.data);
      setEventReportData(response.data);
    } catch (error) {
      console.log('Error occurred while fetching event income', error);
    }
  }

  const getFilteredAnnualData = () => {
    if (!annualIncomeData.length || !annualExpenseData.length) {
      return { income: [], expenses: [] };
    }
    return {
      income: annualIncomeData.slice(startMonth, endMonth + 1),
      expenses: annualExpenseData.slice(startMonth, endMonth + 1)
    };
  };

  const filteredData = getFilteredAnnualData();

  const calculateAnnualTotals = () => {
    if (!filteredData.income.length || !filteredData.expenses.length) {
      return {
        totalIncome: { membership: 0, donations: 0, total: 0 },
        totalExpenses: { eventExpenseTotal: 0, maintenanceExpenseTotal: 0, otherExpensesTotal: 0, total: 0 },
        netProfit: 0
      };
    }

    const totalIncome = filteredData.income.reduce((sum, item) => ({
      membership: sum.membership + (item.membership || 0),
      donations: sum.donations + (item.donations || 0),
      total: sum.total + (item.total || 0)
    }), { membership: 0, donations: 0, total: 0 });

    const totalExpenses = filteredData.expenses.reduce((sum, item) => {
      const monthTotal = (item.eventExpenseTotal || 0) + (item.maintenanceExpenseTotal || 0) + (item.otherExpensesTotal || 0);
      return {
        eventExpenseTotal: sum.eventExpenseTotal + (item.eventExpenseTotal || 0),
        maintenanceExpenseTotal: sum.maintenanceExpenseTotal + (item.maintenanceExpenseTotal || 0),
        otherExpensesTotal: sum.otherExpensesTotal + (item.otherExpensesTotal || 0),
        total: sum.total + monthTotal
      };
    }, { eventExpenseTotal: 0, maintenanceExpenseTotal: 0, otherExpensesTotal: 0, total: 0 });

    return { totalIncome, totalExpenses, netProfit: totalIncome.total - totalExpenses.total };
  };

  const annualTotals = calculateAnnualTotals();

  const mergedAnnualData = filteredData.income.map((item, index) => {
    const expenseItem = filteredData.expenses[index];
    if (!expenseItem) return { month: item.month, income: item.total || 0, expenses: 0, profit: item.total || 0 };
    const totalExpenses = (expenseItem.eventExpenseTotal || 0) + (expenseItem.maintenanceExpenseTotal || 0) + (expenseItem.otherExpensesTotal || 0);
    return { month: item.month, income: item.total || 0, expenses: totalExpenses, profit: (item.total || 0) - totalExpenses };
  });

  const exportToCSV = () => {
    let csvContent = '';

    if (reportType === 'annual') {
      csvContent = 'Month,Membership Payments,Donations,Total Income,Event Expenses,Maintenance Expenses,Other Expenses,Total Expenses,Net Profit\n';
      filteredData.income.forEach((item, index) => {
        const expense = filteredData.expenses[index] || { eventExpenseTotal: 0, maintenanceExpenseTotal: 0, otherExpensesTotal: 0 };
        const totalExpenses = (expense.eventExpenseTotal || 0) + (expense.maintenanceExpenseTotal || 0) + (expense.otherExpensesTotal || 0);
        const profit = (item.total || 0) - totalExpenses;
        csvContent += `${item.month},${item.membership || 0},${item.donations || 0},${item.total || 0},${expense.eventExpenseTotal || 0},${expense.maintenanceExpenseTotal || 0},${expense.otherExpensesTotal || 0},${totalExpenses},${profit}\n`;
      });
    } else if (reportType === 'event' && eventReportData) {
      // ✅ FIXED: Use correct API response fields
      const totalExpenses = eventReportData.eventExpenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
      const totalIncome = eventReportData.totalEventIncome || 0;
      const donations = eventReportData.eventDonations || [];
      const incomes = eventReportData.eventIncomes || [];

      csvContent = `Event Report - ${eventReportData.eventName}\n`;
      csvContent += `Date: ${eventReportData.date}\n\n`;
      csvContent += 'Donations\n';
      csvContent += 'Donor,Remarks,Date,Amount\n';
      donations.forEach(d => {
        csvContent += `${d.donor?.name || d.donor?.fullName || 'N/A'},${d.remarks || ''},${d.date || 'N/A'},${d.amount || 0}\n`;
      });
      if (incomes.length > 0) {
        csvContent += '\nOther Income\n';
        csvContent += 'Source,Date,Amount\n';
        incomes.forEach(inc => {
          csvContent += `${inc.source || inc.description || 'N/A'},${inc.date || 'N/A'},${inc.amount || 0}\n`;
        });
      }
      csvContent += `\nTotal Income,${totalIncome}\n\n`;
      csvContent += 'Expenses\n';
      csvContent += 'Description,Date,Amount\n';
      (eventReportData.eventExpenses || []).forEach(exp => {
        csvContent += `${exp.description || exp.reason || 'N/A'},${exp.date || 'N/A'},${exp.amount || 0}\n`;
      });
      csvContent += `\nTotal Expenses,${totalExpenses}\n`;
      csvContent += `Net Profit,${totalIncome - totalExpenses}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${Date.now()}.csv`;
    a.click();
  };

  //Export to PDF function using html2canvas and jsPDF
  const exportToPDF = async () => {
    setIsDownloading(true);
  const element = reportRef.current;
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,

    onclone: (clonedDoc) => {
      // Force all elements to use safe colors
      const all = clonedDoc.querySelectorAll("*");

      all.forEach(el => {
        el.style.color = "#000000";
        el.style.backgroundColor = "#ffffff";
        el.style.borderColor = "#000000";
      });
    }
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save(`annual-report-${selectedYear}.pdf`);
  setIsDownloading(false);
};
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (isEventReportsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Event report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7A5AF8] via-purple-600 to-[#5D45BC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto pt-32">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-purple-800 rounded-3xl shadow-2xl p-8 md:p-10 mb-8 text-white relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24 blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-yellow-300 opacity-10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Welfare Net Reports</h1>
              <p className="text-purple-100 text-lg">Generate comprehensive financial reports</p>
            </div>
            <div className="flex gap-3">
              <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                <Download size={18} /> Export CSV
              </button>
              <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <Download size={18} />{isDownloading ? "Exporting..." : "Export PDF"}
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setReportType('annual')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${reportType === 'annual' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Calendar size={20} /> Annual Report
            </button>
            <button
              onClick={() => { setReportType('event'); setIsEventReportsLoading(true); fetchEventsList(); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${reportType === 'event' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <FileText size={20} /> Event Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-8 mb-8 shadow-md">
          {reportType === 'annual' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value={currentYear}>{currentYear}</option>
                  <option value={currentYear - 1}>{currentYear - 1}</option>
                  <option value={currentYear - 2}>{currentYear - 2}</option>
                  <option value={currentYear - 3}>{currentYear - 3}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Month</label>
                <select value={startMonth} onChange={(e) => setStartMonth(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  {months.map((month, index) => (<option key={index} value={index}>{month}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Month</label>
                <select value={endMonth} onChange={(e) => setEndMonth(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  {months.map((month, index) => (<option key={index} value={index} disabled={index < startMonth}>{month}</option>))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => {
                  setSelectedEvent(eventsList.find(event => event.eventId === Number(e.target.value)));
                  setEventReportData(null);
                  fetchEventIncome(Number(e.target.value));
                  console.log('Selected Event ID : ', e.target.value);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Select an event --</option>
                {eventsList.map(event => (
                  <option key={event.eventId} value={event.eventId} >{event.eventName} ({event.date})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Report Content */}
        {reportType === 'annual' ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">LKR.  {annualTotals.totalIncome.total.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full"><TrendingUp className="text-green-600" size={24} /></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">LKR.  {annualTotals.totalExpenses.total.toLocaleString()}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full"><DollarSign className="text-red-600" size={24} /></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Net Profit/Loss</p>
                    <p className={`text-2xl font-bold ${annualTotals.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      LKR.  {Math.abs(annualTotals.netProfit).toLocaleString()}
                    </p>
                  </div>
                  <div className={`${annualTotals.netProfit >= 0 ? 'bg-blue-100' : 'bg-orange-100'} p-3 rounded-full`}>
                    <TrendingUp className={annualTotals.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'} size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Period</p>
                    <p className="text-lg font-bold text-gray-800">{months[startMonth]} - {months[endMonth]}</p>
                    <p className="text-xs text-gray-500">{selectedYear}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full"><Calendar className="text-purple-600" size={24} /></div>
                </div>
              </div>
            </div>

            {/* Income vs Expenses Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Income vs Expenses Overview</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={mergedAnnualData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Total Income" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Total Expenses" />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Net Profit" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Income Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Income Breakdown</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={filteredData.income}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="membership" fill="#3b82f6" name="Membership Payments" />
                  <Bar dataKey="donations" fill="#10b981" name="Donations" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Expenses Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Expenses Breakdown</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={filteredData.expenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="eventExpenseTotal" fill="#f59e0b" name="Event Expenses" />
                  <Bar dataKey="maintenanceExpenseTotal" fill="#ef4444" name="Maintenance Expenses" />
                  <Bar dataKey="otherExpensesTotal" fill="#8b5cf6" name="Other Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Monthly Table */}
            <div className="bg-white rounded-xl shadow-lg p-6" ref={reportRef} >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Month-by-Month Breakdown</h2>
              <div className="overflow-x-auto" >
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Month</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Memberships</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Donations</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total Income</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Event Expenses</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Maintenance</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Other</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total Expenses</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.income.map((item, index) => {
                      const expense = filteredData.expenses[index] || { eventExpenseTotal: 0, maintenanceExpenseTotal: 0, otherExpensesTotal: 0 };
                      const totalExpenses = (expense.eventExpenseTotal || 0) + (expense.maintenanceExpenseTotal || 0) + (expense.otherExpensesTotal || 0);
                      const profit = (item.total || 0) - totalExpenses;
                      return (
                        <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800 font-medium">{item.month}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">LKR. {(item.membership || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">LKR. {(item.donations || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-green-600 font-semibold text-right">LKR. {(item.total || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">LKR. {(expense.eventExpenseTotal || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">LKR. {(expense.maintenanceExpenseTotal || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">LKR. {(expense.otherExpensesTotal || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-red-600 font-semibold text-right">LKR. {totalExpenses.toLocaleString()}</td>
                          <td className={`px-4 py-3 text-sm font-bold text-right ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            LKR. {Math.abs(profit).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                      <td className="px-4 py-3 text-sm text-gray-800">TOTAL</td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-right">LKR. {annualTotals.totalIncome.membership.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-right">LKR. {annualTotals.totalIncome.donations.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-green-600 text-right">LKR. {annualTotals.totalIncome.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-right">LKR. {annualTotals.totalExpenses.eventExpenseTotal.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-right">LKR. {annualTotals.totalExpenses.maintenanceExpenseTotal.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 text-right">LKR. {annualTotals.totalExpenses.otherExpensesTotal.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-red-600 text-right">LKR. {annualTotals.totalExpenses.total.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-sm text-right ${annualTotals.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        LKR. {Math.abs(annualTotals.netProfit).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {(selectedEvent && eventReportData) ? (() => {
              // ✅ FIXED: Use correct API fields
              const totalExpenses = eventReportData.eventExpenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
              const totalIncome = eventReportData.totalEventIncome || 0;
              const netProfit = totalIncome - totalExpenses;
              const donations = eventReportData.eventDonations || [];
              const incomes = eventReportData.eventIncomes || [];

              return (
                <>
                  {/* Event Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-md p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Income</p>
                          <p className="text-2xl font-bold text-green-600">LKR.  {totalIncome.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full"><TrendingUp className="text-green-600" size={24} /></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Expenses</p>
                          <p className="text-2xl font-bold text-red-600">LKR.  {totalExpenses.toLocaleString()}</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full"><DollarSign className="text-red-600" size={24} /></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Net Profit/Loss</p>
                          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            LKR.  {Math.abs(netProfit).toLocaleString()}
                          </p>
                        </div>
                        <div className={`${netProfit >= 0 ? 'bg-blue-100' : 'bg-orange-100'} p-3 rounded-full`}>
                          <TrendingUp className={netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'} size={24} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedEvent.eventName}</h2>
                    <p className="text-gray-600 mb-2">Event Date: {selectedEvent.date}</p>
                    <p className="text-gray-600 mb-2">Event Type: <span className="capitalize">{selectedEvent.eventType}</span></p>
                    <p className="text-gray-600 mb-6">Venue: {selectedEvent.venue || 'Not specified'}</p>
                  </div>

                  {/* ✅ FIXED: Donations Table — uses eventDonations with correct fields */}
                  {donations.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Donation Records</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Donor</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Remarks</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                              
                            </tr>
                          </thead>
                          <tbody>
                            {donations.map((d, index) => (
                              <tr key={d.donationId || index} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-800">
                                  {d.donor?.name || d.donor?.fullName || d.donor?.username || `Donor #${index + 1}`}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{d.remarks || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{d.date || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-green-600 font-semibold text-right">
                                  LKR.  {(d.amount || 0).toLocaleString()}
                                </td>
        
                              </tr>
                            ))}
                            <tr className="border-t-2 border-gray-300 bg-green-50 font-bold">
                              <td colSpan="4" className="px-4 py-3 text-sm text-gray-800">TOTAL DONATIONS</td>
                              <td className="px-4 py-3 text-sm text-green-600 text-right">
                                LKR.  {donations.reduce((s, d) => s + (d.amount || 0), 0).toLocaleString()}
                              </td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Other Income Records (eventIncomes array — currently empty but future-proof) */}
                  {incomes.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Other Income Records</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Source/Description</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {incomes.map((inc, index) => (
                              <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-800">{inc.source || inc.description || `Income #${index + 1}`}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{inc.date || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-green-600 font-semibold text-right">${(inc.amount || 0).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Expense Records */}
                  {eventReportData.eventExpenses && eventReportData.eventExpenses.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Expense Records</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {eventReportData.eventExpenses.map((expense, index) => (
                              <tr key={expense.id || index} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-800">{expense.description || expense.reason || `Expense #${index + 1}`}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{expense.date || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-red-600 font-semibold text-right">LKR.  {(expense.amount || 0).toLocaleString()}</td>
                              </tr>
                            ))}
                            <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                              <td colSpan="3" className="px-4 py-3 text-sm text-gray-800">TOTAL EXPENSES</td>
                              <td className="px-4 py-3 text-sm text-red-600 text-right">LKR. {totalExpenses.toLocaleString()}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Net Profit/Loss Summary */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold text-gray-800">NET PROFIT/LOSS</h3>
                      <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {netProfit >= 0 ? '+' : '-'}LKR.  {Math.abs(netProfit).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </>
              );
            })() : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Event Selected</h3>
                <p className="text-gray-500">Please select an event from the dropdown above to view its report</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsGenerator;