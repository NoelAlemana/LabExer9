import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const EncodingVisualizer = () => {
  const [encodingType, setEncodingType] = useState('NRZ-L');
  const [inputText, setInputText] = useState('');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  const generateChartData = (dataPoints) => {
    // Generate x-axis labels, incrementing by 0.5 but showing only integer labels
    const labels = Array.from({ length: dataPoints.length }, (_, index) => 
      encodingType === 'Manchester' || encodingType === 'Differential Manchester' ? index * 0.5 : index +1
    );

    return {
      labels: labels,
      datasets: [
        {
          label: 'Digital Signal',
          data: dataPoints,
          fill: false,
          borderColor: 'blue',
          borderWidth: 5,
          stepped: true,
        },
      ],
    };
  };

  const handleEncoding = () => {
    let dataPoints = [];
    switch (encodingType) {
      case 'NRZ-L':
        dataPoints = NRZL(inputText);
        break;
      case 'NRZ-I':
        dataPoints = NRZI(inputText);
        break;
      case 'Bipolar':
        dataPoints = Bipolar(inputText);
        break;
      case 'Pseudoternary':
        dataPoints = Pseudoternary(inputText);
        break;
      case 'Manchester':
        dataPoints = Manchester(inputText);
        break;
      case 'Differential Manchester':
        dataPoints = DifferentialManchester(inputText);
        break;
      default:
        break;
    }
    setChartData(generateChartData(dataPoints));
  };

  const NRZL = (text) => {
    // Modify NRZ-L to range from 0 to 5
    const points = text.split('').map(bit => (bit === '1' ? 5 : 0));
    points.push(points[points.length - 1]); // Extend the last value
    return points;
  };

  const NRZI = (text) => {
    // Modify NRZ-I to range from 0 to 5
    let currentLevel = 0;
    const points = text.split('').map(bit => {
      if (bit === '1') currentLevel = currentLevel === 5 ? 0 : 5;
      return currentLevel;
    });
    points.push(points[points.length - 1]); // Extend the last value
    return points;
  };

  const Bipolar = (text) => {
    let lastLevel = 5;
    const points = text.split('').map(bit => {
      if (bit === '1') {
        lastLevel = -lastLevel;
        return lastLevel;
      }
      return 0;
    });
    points.push(points[points.length - 1]); // Extend the last value
    return points;
  };

  const Pseudoternary = (text) => {
    let isPositive = false;
    const points = text.split('').map(bit => {
      if (bit === '0') {
        isPositive = !isPositive;
        return isPositive ? 5 : -5;
      }
      return 0;
    });
    points.push(points[points.length - 1]); // Extend the last value
    return points;
  };

  const Manchester = (text) => {
    const points = [];
    text.split('').forEach(bit => {
      if (bit === '1') {
        points.push(0, 5);
      } else {
        points.push(5, 0);
      }
    });
    points.push(points[points.length - 1]); // Extend the last value
    return points;
  };

  const DifferentialManchester = (text) => {
    let currentLevel = 5;
    const points = [];
    text.split('').forEach(bit => {
      // Initial transition for every bit period

      // Middle transition only if bit is '0'
      if (bit === '0') {
        currentLevel = currentLevel === 5 ? 0 : 5;
      }
  
      points.push(currentLevel);
      
      currentLevel = currentLevel === 5 ? 0 : 5;
      points.push(currentLevel);
  
    });
    points.push(points[points.length - 1]); // Extend the last value
    return points;
  };
  

  return (
    <div style={{ textAlign: 'center', maxWidth: 800, margin: 'auto' }}>
      <h2>Digital Encoding Visualizer</h2>
      <div>
        <label>
          Input Text (Binary):
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter binary sequence, e.g., 1010"
          />
        </label>
      </div>
      <div>
        <label>
          Encoding Type:
          <select
            value={encodingType}
            onChange={(e) => setEncodingType(e.target.value)}
          >
            <option>NRZ-L</option>
            <option>NRZ-I</option>
            <option>Bipolar</option>
            <option>Pseudoternary</option>
            <option>Manchester</option>
            <option>Differential Manchester</option>
          </select>
        </label>
      </div>
      <button onClick={handleEncoding} style={{ margin: '20px' }}>
        Generate Signal
      </button>
      <div style={{ width: '100%', height: '400px' }}>
        <Line
          data={chartData}
          options={{
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Time (t)',
                },
                grid: {
                  color: 'black',
                  lineWidth: 1,
                  borderDash: [5, 5],
                },
                ticks: {
                  stepSize: encodingType === 'Manchester' || encodingType === 'Differential Manchester' ? 0.5 : 1,
                  callback: function(value) {
                    // Only show labels for even integers, and divide them by 2 for display
                    if (Number.isInteger(value) && value % 2 === 0) {
                      return value / 2;
                    }
                    return ''; // Hide other values
                  },
                },
                
              },
              y: {
                title: {
                  display: true,
                  text: 'Volts (V)',
                },
                min: -5,
                max: 5,
                grid: {
                  color: 'black',
                  lineWidth: 1,
                },
                ticks: {
                  stepSize: 1,
                },
              },
            },
            plugins: {
              legend: {
                position: 'top',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default EncodingVisualizer;
