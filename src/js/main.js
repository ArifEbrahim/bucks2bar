document.addEventListener('DOMContentLoaded', function () {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  // Helper to get values from inputs
  function getMonthlyData(type) {
    return months.map(month => {
      const input = document.getElementById(`${month.toLowerCase()}-${type}`)
      return input && input.value ? Number(input.value) : 0
    })
  }

  let barChartInstance = null

  // Show chart when Chart tab is activated
  document.getElementById('chart-tab').addEventListener('shown.bs.tab', function () {
    const incomeData = getMonthlyData('income')
    const expenseData = getMonthlyData('expense')

    const ctx = document.getElementById('barChart').getContext('2d')

    // Destroy previous chart if exists
    if (barChartInstance) {
      barChartInstance.destroy()
    }

    barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
          },
          {
            label: 'Expense',
            data: expenseData,
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Monthly Income vs Expense' },
        },
      },
    })
  })
})
