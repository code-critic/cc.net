import { Container } from '@material-ui/core';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import React from 'react'
import { SimpleLoader } from './SimpleLoader';
import addHistogramModule from 'highcharts/modules/histogram-bellcurve';
import { useResource } from "./useResource";

addHistogramModule(Highcharts);

const hist = {
    xAxis: [{
        title: { text: 'Data' },
        alignTicks: false
    }, {
        title: { text: 'Histogram' },
        alignTicks: false,
        opposite: true
    }],

    yAxis: [{
        title: { text: 'Data' }
    }, {
        title: { text: 'Histogram' },
        opposite: true
    }],

    plotOptions: {
        histogram: {
            accessibility: {
                pointDescriptionFormatter: function (point) {
                    var ix = point.index + 1,
                        x1 = point.x.toFixed(3),
                        x2 = point.x2.toFixed(3),
                        val = point.y;
                    return ix + '. ' + x1 + ' to ' + x2 + ', ' + val + '.';
                }
            }
        }
    },
}

export const GlobalStats = (props) => {
    const stats = useResource<any[]>("stats/all-stats");

    if (!stats) {
        return <SimpleLoader title="loading stats" />
    }

    return <Container>{stats.map(i =>
        <HighchartsReact
            highcharts={Highcharts}
            options={i.histogram === true ? {...i, ...hist} : i}
        />)}
    </Container>
}