const init = (el) => {
  if (!el) return;

  // Load Chart.js if not available
  const loadChartJS = async () => {
    if (typeof Chart === 'undefined') {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Chart.js'));
        document.head.appendChild(script);
      });
    }
    return Promise.resolve();
  };

  // State management
  let currentData = [];
  let previousData = [];
  let currentPeriod = '1w';
  let currentAgo = '0w';
  const hiddenProjects = new Set();

  // Update chart with current data
  const updateChart = () => {
    createChart(currentData);
  };

  // Update project toggles display
  const updateProjectToggles = () => {
    const checkboxes = el.querySelectorAll('.project-checkbox');
    checkboxes.forEach((checkbox) => {
      const { repo } = checkbox.dataset;
      checkbox.checked = !hiddenProjects.has(repo);

      const toggle = checkbox.closest('.project-toggle');
      if (hiddenProjects.has(repo)) {
        toggle.classList.add('hidden');
      } else {
        toggle.classList.remove('hidden');
      }
    });
  };

  // Create the chart structure
  const createChartStructure = () => {
    el.innerHTML = `
      <div class="repo-chart-fullscreen">
        <div class="repo-chart">
          <div class="chart-header">
            <h2 class="title">Repository Activity Dashboard</h2>
            <p class="subtitle">Full-screen view of publishing activity across all repositories</p>
          </div>
          
          <div class="chart-controls">
            <div class="period-selector">
              <label>Time Period:</label>
              <select id="period-select">
                <option value="1w">1 Week</option>
                <option value="2w">2 Weeks</option>
                <option value="3w">3 Weeks</option>
                <option value="4w">4 Weeks</option>
              </select>
            </div>
            
            <div class="navigation-controls">
              <button id="prev-btn" class="nav-btn">← Previous</button>
              <span id="current-period" class="current-period">This Week</span>
              <button id="next-btn" class="nav-btn">Next →</button>
            </div>
          </div>
          
          <div class="project-selector">
            <h3>Project Visibility Controls</h3>
            <div class="project-filters">
              <button id="show-all-btn" class="filter-btn">Show All</button>
              <button id="hide-all-btn" class="filter-btn">Hide All</button>
              <button id="hide-top-btn" class="filter-btn">Hide Top Project</button>
            </div>
            <div id="project-toggles" class="project-toggles">
              <!-- Project toggles will be populated here -->
            </div>
          </div>
          
          <div class="chart-container">
            <div class="chart-wrapper">
              <canvas id="repo-chart"></canvas>
            </div>
          </div>
          
          <div class="trend-analysis">
            <h3>Trend Analysis</h3>
            <div id="trend-content" class="trend-content">
              <p>Loading trend data...</p>
            </div>
          </div>
          
          <div class="footnote">
            Data source: Git activity logs | Last updated: <span id="last-updated"></span>
          </div>
        </div>
      </div>
    `;
  };

  // Fetch data from server
  const fetchData = async (since, ago) => {
    try {
      const url = `http://localhost:8080/eds-logs?since=${since}&ago=${ago}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.filter((item) => item.repo && item.amount); // Filter out null repos
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };

  // Calculate trend comparison
  const calculateTrend = (current, previous) => {
    if (!previous || previous.length === 0) return null;

    const trendData = [];

    current.forEach((currentItem) => {
      const previousItem = previous.find((p) => p.repo === currentItem.repo);
      if (previousItem) {
        const currentAmount = parseInt(currentItem.amount, 10);
        const previousAmount = parseInt(previousItem.amount, 10);
        const change = currentAmount - previousAmount;
        const percentChange = previousAmount > 0 ? (change / previousAmount) * 100 : 0;

        let trend;
        if (change > 0) {
          trend = 'up';
        } else if (change < 0) {
          trend = 'down';
        } else {
          trend = 'stable';
        }

        trendData.push({
          repo: currentItem.repo,
          current: currentAmount,
          previous: previousAmount,
          change,
          percentChange,
          trend,
        });
      }
    });

    return trendData;
  };

  // Update trend display
  const updateTrendDisplay = (trendData) => {
    const trendContent = el.querySelector('#trend-content');

    if (!trendData || trendData.length === 0) {
      trendContent.innerHTML = '<p>No trend data available for comparison.</p>';
      return;
    }

    const topPerformers = trendData
      .filter((item) => item.trend === 'up')
      .sort((a, b) => b.percentChange - a.percentChange)
      .slice(0, 3);

    const decliningRepos = trendData
      .filter((item) => item.trend === 'down')
      .sort((a, b) => a.percentChange - b.percentChange)
      .slice(0, 3);

    let html = '<div class="trend-grid">';

    if (topPerformers.length > 0) {
      html += `
        <div class="trend-section positive">
          <h4>📈 Top Performers</h4>
          <ul>
            ${topPerformers.map((item) => `
              <li>
                <span class="repo-name">${item.repo}</span>
                <span class="trend-value positive">+${item.percentChange.toFixed(1)}%</span>
                <span class="trend-detail">(${item.change > 0 ? '+' : ''}${item.change})</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    if (decliningRepos.length > 0) {
      html += `
        <div class="trend-section negative">
          <h4>📉 Declining Activity</h4>
          <ul>
            ${decliningRepos.map((item) => `
              <li>
                <span class="repo-name">${item.repo}</span>
                <span class="trend-value negative">${item.percentChange.toFixed(1)}%</span>
                <span class="trend-detail">(${item.change})</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    html += '</div>';
    trendContent.innerHTML = html;
  };

  // Create project toggles
  const createProjectToggles = (data) => {
    const togglesContainer = el.querySelector('#project-toggles');
    if (!togglesContainer) return;

    // Sort data by amount descending
    const sortedData = data
      .sort((a, b) => parseInt(b.amount, 10) - parseInt(a.amount, 10));

    const html = sortedData.map((item, index) => {
      const isHidden = hiddenProjects.has(item.repo);
      const amount = parseInt(item.amount, 10).toLocaleString();
      const isTopProject = index === 0;

      return `
        <div class="project-toggle ${isHidden ? 'hidden' : ''} ${isTopProject ? 'top-project' : ''}">
          <label class="toggle-label">
            <input type="checkbox" 
                   class="project-checkbox" 
                   data-repo="${item.repo}" 
                   ${!isHidden ? 'checked' : ''}>
            <span class="toggle-text">
              <span class="repo-name">${item.repo}</span>
              <span class="repo-amount">${amount}</span>
            </span>
          </label>
        </div>
      `;
    }).join('');

    togglesContainer.innerHTML = html;

    // Add event listeners to checkboxes
    const checkboxes = togglesContainer.querySelectorAll('.project-checkbox');
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', (e) => {
        const { repo } = e.target.dataset;
        if (e.target.checked) {
          hiddenProjects.delete(repo);
        } else {
          hiddenProjects.add(repo);
        }
        updateChart();
      });
    });
  };

  // Create chart using Chart.js
  const createChart = (data) => {
    const canvas = el.querySelector('#repo-chart');
    if (!canvas) return;

    // Destroy existing chart if it exists
    if (window.repoChartInstance) {
      window.repoChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');

    // Filter out hidden projects and sort by amount descending
    const visibleData = data.filter((item) => !hiddenProjects.has(item.repo));
    const sortedData = visibleData
      .sort((a, b) => parseInt(b.amount, 10) - parseInt(a.amount, 10));

    const labels = sortedData.map((item) => item.repo);
    const values = sortedData.map((item) => parseInt(item.amount, 10));

    // Generate colors
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#FF9F43', '#10AC84', '#5F27CD', '#FF6348', '#2ED573',
      '#1E90FF', '#FF4757', '#3742FA', '#2F3542', '#5352ED',
    ];

    if (typeof Chart === 'undefined') {
      console.error('Chart.js not loaded');
      return;
    }

    window.repoChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Activity',
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map((color) => `${color}80`),
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#666',
            borderWidth: 1,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              label(context) {
                return `Activity: ${context.parsed.y.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
              drawBorder: false,
            },
            ticks: {
              color: '#666',
              font: { size: 12 },
            },
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#666',
              font: { size: 11 },
              maxRotation: 45,
              minRotation: 0,
            },
          },
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart',
        },
      },
    });
  };

  // Update period display
  const updatePeriodDisplay = () => {
    const periodText = el.querySelector('#current-period');
    const periodMap = {
      '1w': '1 Week',
      '2w': '2 Weeks',
      '3w': '3 Weeks',
      '4w': '4 Weeks',
    };

    const agoText = currentAgo === '0w' ? 'Current' : `${currentAgo} ago`;
    periodText.textContent = `${agoText} (${periodMap[currentPeriod]})`;
  };

  // Load and display data
  const loadData = async () => {
    // Show loading state
    const chartWrapper = el.querySelector('.chart-wrapper');
    chartWrapper.innerHTML = '<div class="loading">Loading data...</div>';

    try {
      // Fetch current period data
      currentData = await fetchData(currentPeriod, currentAgo);

      // Fetch previous period data for comparison
      const previousAgo = currentAgo === '0w' ? currentPeriod
        : `${parseInt(currentAgo, 10) + parseInt(currentPeriod, 10)}w`;
      previousData = await fetchData(currentPeriod, previousAgo);

      // Create project toggles
      createProjectToggles(currentData);

      // Update chart
      chartWrapper.innerHTML = '<canvas id="repo-chart"></canvas>';
      createChart(currentData);

      // Update trend analysis
      const trendData = calculateTrend(currentData, previousData);
      updateTrendDisplay(trendData);

      // Update period display
      updatePeriodDisplay();

      // Update last updated timestamp
      const lastUpdated = el.querySelector('#last-updated');
      lastUpdated.textContent = new Date().toLocaleString();
    } catch (error) {
      console.error('Error loading data:', error);
      chartWrapper.innerHTML = '<div class="error">Error loading data. Please try again.</div>';
    }
  };

  // Event handlers
  const setupEventHandlers = () => {
    // Period selector
    const periodSelect = el.querySelector('#period-select');
    periodSelect.addEventListener('change', (e) => {
      currentPeriod = e.target.value;
      currentAgo = '0w';
      loadData();
    });

    // Navigation buttons
    const prevBtn = el.querySelector('#prev-btn');
    const nextBtn = el.querySelector('#next-btn');

    prevBtn.addEventListener('click', () => {
      if (currentAgo === '0w') {
        currentAgo = currentPeriod;
      } else {
        currentAgo = `${parseInt(currentAgo, 10) + parseInt(currentPeriod, 10)}w`;
      }
      loadData();
    });

    nextBtn.addEventListener('click', () => {
      if (currentAgo !== '0w') {
        const newAgo = parseInt(currentAgo, 10) - parseInt(currentPeriod, 10);
        currentAgo = newAgo <= 0 ? '0w' : `${newAgo}w`;
        loadData();
      }
    });

    // Project filter buttons
    const showAllBtn = el.querySelector('#show-all-btn');
    const hideAllBtn = el.querySelector('#hide-all-btn');
    const hideTopBtn = el.querySelector('#hide-top-btn');

    showAllBtn.addEventListener('click', () => {
      hiddenProjects.clear();
      updateProjectToggles();
      updateChart();
    });

    hideAllBtn.addEventListener('click', () => {
      currentData.forEach((item) => hiddenProjects.add(item.repo));
      updateProjectToggles();
      updateChart();
    });

    hideTopBtn.addEventListener('click', () => {
      if (currentData.length > 0) {
        const sortedData = currentData
          .sort((a, b) => parseInt(b.amount, 10) - parseInt(a.amount, 10));
        const topProject = sortedData[0].repo;
        hiddenProjects.add(topProject);
        updateProjectToggles();
        updateChart();
      }
    });
  };

  // Initialize the chart
  const initChart = async () => {
    await loadChartJS(); // Wait for Chart.js to load
    createChartStructure();
    setupEventHandlers();
    loadData();
  };

  // Start initialization
  initChart();
};

export default init;
