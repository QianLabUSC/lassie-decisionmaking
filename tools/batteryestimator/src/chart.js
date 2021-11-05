import React, { Component } from 'react';
import ApexChart from "react-apexcharts";

const lineChartOptions = {
    chart: {
        height: 350,
        toolbar: { show: false },
        type: 'line',
        zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'],
        opacity: 0.5
      },
    },
    yaxis: [
        {
            labels: { formatter: v => v.toFixed(0) }
        }
    ]
};

export default class Chart extends Component {
    render() {
        const series = [
            {
                name: "Max Samples",
                data: this.props.data
            }
        ];
        return (
            <ApexChart
                options={lineChartOptions}
                series={series}
                type="line"
                width="450"
            />
        )
    }
}
