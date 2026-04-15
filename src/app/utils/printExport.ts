import type { LeaveApplication, User, LeaveType, LeaveBalance } from '../types';
import { formatDate, calculateLeaveDays } from './leaveCalculations';

export function printApplication(
  application: LeaveApplication,
  employee: User,
  leaveType: LeaveType,
  balance?: LeaveBalance
) {
  const days = calculateLeaveDays(
    application.fromDate,
    application.fromSession,
    application.toDate,
    application.toSession
  );

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Leave Application - ${application.applicationNumber}</title>
      <style>
        @media print {
          @page { margin: 2cm; }
          body { margin: 0; }
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #000;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
        }
        .header h1 {
          margin: 0 0 5px 0;
          font-size: 18pt;
          font-weight: bold;
        }
        .header p {
          margin: 3px 0;
          font-size: 10pt;
        }
        .section {
          margin: 20px 0;
        }
        .section-title {
          font-weight: bold;
          font-size: 13pt;
          margin-bottom: 10px;
          border-bottom: 1px solid #333;
          padding-bottom: 5px;
        }
        .row {
          display: flex;
          margin: 8px 0;
        }
        .label {
          font-weight: bold;
          width: 200px;
          flex-shrink: 0;
        }
        .value {
          flex: 1;
        }
        .workflow {
          margin-top: 10px;
          border-left: 3px solid #333;
          padding-left: 15px;
        }
        .workflow-item {
          margin: 10px 0;
          padding: 10px;
          background: #f5f5f5;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 9pt;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          border: 1px solid #333;
          padding: 8px;
          text-align: left;
        }
        th {
          background: #f0f0f0;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ANDHRA PRADESH TRANSMISSION CORPORATION LIMITED</h1>
        <p>(APTRANSCO)</p>
        <p>Leave Application</p>
      </div>

      <div class="section">
        <div class="row">
          <div class="label">Application Number:</div>
          <div class="value"><strong>${application.applicationNumber}</strong></div>
        </div>
        <div class="row">
          <div class="label">Application Date:</div>
          <div class="value">${formatDate(application.submittedDate || new Date().toISOString())}</div>
        </div>
        <div class="row">
          <div class="label">Status:</div>
          <div class="value"><strong>${application.status}</strong></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Employee Details</div>
        <div class="row">
          <div class="label">Name:</div>
          <div class="value">${employee.name}</div>
        </div>
        <div class="row">
          <div class="label">Employee ID:</div>
          <div class="value">${employee.employeeId}</div>
        </div>
        <div class="row">
          <div class="label">Designation:</div>
          <div class="value">${employee.designation}</div>
        </div>
        <div class="row">
          <div class="label">Department:</div>
          <div class="value">${employee.department}</div>
        </div>
        <div class="row">
          <div class="label">Office:</div>
          <div class="value">${employee.office}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Leave Details</div>
        <div class="row">
          <div class="label">Leave Type:</div>
          <div class="value">${leaveType.name} (${leaveType.code})</div>
        </div>
        <div class="row">
          <div class="label">From:</div>
          <div class="value">${formatDate(application.fromDate)} (${application.fromSession === 'FN' ? 'Forenoon' : 'Afternoon'})</div>
        </div>
        <div class="row">
          <div class="label">To:</div>
          <div class="value">${formatDate(application.toDate)} (${application.toSession === 'FN' ? 'Forenoon' : 'Afternoon'})</div>
        </div>
        <div class="row">
          <div class="label">Duration:</div>
          <div class="value"><strong>${days} days</strong></div>
        </div>
        <div class="row">
          <div class="label">Reason:</div>
          <div class="value">${application.reason}</div>
        </div>
        <div class="row">
          <div class="label">Leave Address:</div>
          <div class="value">${application.leaveAddress}</div>
        </div>
        ${application.contactNumber ? `
        <div class="row">
          <div class="label">Contact Number:</div>
          <div class="value">${application.contactNumber}</div>
        </div>
        ` : ''}
      </div>

      ${balance ? `
      <div class="section">
        <div class="section-title">Leave Balance</div>
        <table>
          <tr>
            <th>Opening Balance</th>
            <th>Credited</th>
            <th>Availed</th>
            <th>Available</th>
            <th>After This Leave</th>
          </tr>
          <tr>
            <td>${balance.openingBalance}</td>
            <td>${balance.credited}</td>
            <td>${balance.availed}</td>
            <td>${balance.openingBalance + balance.credited - balance.availed}</td>
            <td><strong>${balance.openingBalance + balance.credited - balance.availed - days}</strong></td>
          </tr>
        </table>
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Workflow History</div>
        <div class="workflow">
          ${application.workflowHistory.map((item) => `
            <div class="workflow-item">
              <strong>${item.action}</strong> - ${formatDate(item.actionDate)}<br/>
              By: ${item.actionByName} (${item.role})<br/>
              ${item.remarks ? `Remarks: ${item.remarks}` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="footer">
        <p>This is a computer-generated document from APTRANSCO Leave Management System</p>
        <p>Printed on: ${new Date().toLocaleString('en-IN')}</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          // Close after printing (optional)
          // setTimeout(() => window.close(), 100);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || '');
        return stringValue.includes(',') || stringValue.includes('"')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportApplicationsToCSV(applications: LeaveApplication[], employees: Map<string, User>, leaveTypes: Map<string, LeaveType>) {
  const data = applications.map(app => {
    const employee = employees.get(app.employeeId);
    const leaveType = leaveTypes.get(app.leaveTypeId);
    const days = calculateLeaveDays(app.fromDate, app.fromSession, app.toDate, app.toSession);

    return {
      'Application Number': app.applicationNumber,
      'Employee Name': employee?.name || '',
      'Employee ID': employee?.employeeId || '',
      'Department': employee?.department || '',
      'Leave Type': leaveType?.name || '',
      'From Date': formatDate(app.fromDate),
      'To Date': formatDate(app.toDate),
      'Duration (Days)': days,
      'Status': app.status,
      'Submitted Date': formatDate(app.submittedDate || ''),
      'Reason': app.reason.replace(/,/g, ';'), // Replace commas to avoid CSV issues
    };
  });

  exportToCSV(data, `leave_applications_${new Date().toISOString().split('T')[0]}`);
}
