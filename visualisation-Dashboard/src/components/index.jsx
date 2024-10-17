import React, { useEffect, useState } from 'react';
import './index.css'; // Your styles
import BarChart from './Graphs/BarChart';
import Heatmap from './Graphs/Heatmap';
import BoxPlot from './Graphs/BoxPlot';
import ScatterPlot from './Graphs/ScatterPlot';
import LineChart from './Graphs/LineChart';
import PieChart from './Graphs/PieChart';
import BubbleChart from './Graphs/BubbleChart';
import StackedBarChart from './Graphs/StackedBarChart';
import LollipopChart from './Graphs/LollipopChart';

// Define the graph components in an array with their updated descriptions and inferences
const graphsData = [
  { id: 1, title: 'Sector vs. Intensity', component: BarChart, description: 'This bar chart visualizes the intensity across different sectors, helping us identify the most active sectors.' },
  { id: 2, title: 'Country vs. Topic', component: Heatmap, description: 'A heatmap showing the distribution of topics across countries, highlighting the frequency and importance of topics in each country.' },
  { id: 3, title: 'Topic vs. Relevance', component: BoxPlot, description: 'A boxplot displaying the relevance of various topics, showing how important each topic is based on data distribution.' },
  { id: 4, title: 'Intensity vs. Relevance', component: ScatterPlot, description: 'This scatter plot helps in spotting relationships between intensity and relevance, helping understand if high intensity is aligned with high relevance.' },
  { id: 6, title: 'Pestle Category vs. Intensity', component: LineChart, description: 'A line chart showing how intensity fluctuates across different PESTLE (Political, Economic, Social, etc.) categories over time.' },
  { id: 7, title: 'Source Distribution by Sector', component: PieChart, description: 'A pie chart showing the distribution of unique sources across different sectors, indicating which sectors rely on a broader range of sources.' },
  { id: 8, title: 'Insight Count by Topic', component: BubbleChart, description: 'A bubble chart representing the count of insights for each topic. Larger bubbles indicate more insights, making it easy to identify popular topics.' },
  { id: 9, title: 'Country vs. Intensity', component: StackedBarChart, description: 'A stacked bar chart comparing the intensity levels across countries, offering insight into how countries contribute to global activity.' },
  { id: 10, title: 'Published Date Trends', component: LollipopChart, description: 'A lollipop chart displaying the number of publications over time, showing when reporting or research activity peaked.' },
];

const Graphs = () => {
  const [activeGraph, setActiveGraph] = useState(null);
  const [maxRange, setMaxRange] = useState(10);
  const [data, setData] = useState([]); // Fetched data
  const [countryNames, setCountryNames] = useState([]); // Unique country names for filters
  const [selectedCountries, setSelectedCountries] = useState([]); // Selected countries for Heatmap & StackedBarChart
  const [startDate, setStartDate] = useState(''); // Start date for LollipopChart
  const [endDate, setEndDate] = useState(''); // End date for LollipopChart

  // Fetch data once when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/data`); // Your API endpoint
        const result = await response.json();

        // Extract unique country names
        const uniqueCountries = [...new Set(result.map(item => item.country).filter(Boolean))];

        setData(result); // Store the fetched data
        setCountryNames(uniqueCountries); // Store unique country names for selection
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Handle country selection (allow max 10)
  const handleCountrySelection = (e, setLocalCountries) => {
    const { value } = e.target;
    setLocalCountries(prevSelected => {
      if (prevSelected.includes(value)) {
        return prevSelected.filter(country => country !== value);
      } else if (prevSelected.length < 10) {
        return [...prevSelected, value];
      }
      return prevSelected;
    });
  };

  // Reset all filters when a graph is shown, and reset selected countries in the filter
  const toggleGraph = (id, resetLocalSelectedCountries, resetLocalStartDate, resetLocalEndDate) => {
    if (activeGraph === id) {
      setActiveGraph(null);
      setTimeout(() => {
        setSelectedCountries([]); // Reset global country selection
        setStartDate(''); // Reset global start date
        setEndDate(''); // Reset global end date
        resetLocalSelectedCountries([]); // Reset local country selection
        resetLocalStartDate(''); // Reset local start date
        resetLocalEndDate(''); // Reset local end date
      }, 300); // Delay of 300ms to ensure values are passed before resetting
    } else {
      setActiveGraph(id); // Set active graph
    }
  };

  return (
    <div className="graphs-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '800px' }}>
      <h1>Data Visualizations</h1>
      
      {graphsData.map((graph) => {
        const GraphComponent = graph.component;
        const isHeatmapOrStackedBarChart = graph.id === 2 || graph.id === 9;
        const isLollipopChart = graph.id === 10;

        // States specific to the country and date filters within each graph
        const [localSelectedCountries, setLocalSelectedCountries] = useState([]);
        const [localStartDate, setLocalStartDate] = useState('');
        const [localEndDate, setLocalEndDate] = useState('');

        return (
          <div key={graph.id} className="graph-block" style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', width: '800px', textAlign: 'center' }}>
            <div className="graph-description" style={{ marginBottom: '10px' }}>
              <h2>{graph.title}</h2>
              <p>{graph.description}</p>
            </div>

            {/* Conditionally render the filter section for Heatmap, StackedBarChart, and LollipopChart */}
            {(isHeatmapOrStackedBarChart || isLollipopChart) && (
              <div className="graph-filter" style={{ marginBottom: '10px' }}>
                {isHeatmapOrStackedBarChart && (
                  <div>
                    <label>Select Countries (Max 10):</label>
                    <select multiple value={localSelectedCountries} onChange={(e) => handleCountrySelection(e, setLocalSelectedCountries)}>
                      {countryNames.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                )}

                {isLollipopChart && (
                  <div>
                    <label>Start Date:</label>
                    <input type="date" value={localStartDate} onChange={(e) => setLocalStartDate(e.target.value)} />
                    <label>End Date:</label>
                    <input type="date" value={localEndDate} onChange={(e) => setLocalEndDate(e.target.value)} />
                  </div>
                )}
              </div>
            )}

            <div className="graph-toggle" style={{ marginBottom: '10px' }} onClick={() => toggleGraph(graph.id, setLocalSelectedCountries, setLocalStartDate, setLocalEndDate)}>
              <button style={{ padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' }}>{activeGraph === graph.id ? 'Hide Graph' : 'Show Graph'}</button>
            </div>

            {activeGraph === graph.id && (
              <div className="graph-content" style={{ marginTop: '10px' }}>
                <GraphComponent
                  data={data}
                  countryList={localSelectedCountries} // Pass selected countries to components
                  startDate={localStartDate} // For LollipopChart
                  endDate={localEndDate} // For LollipopChart
                  maxRange={maxRange} // Pass max range to components
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Graphs;
