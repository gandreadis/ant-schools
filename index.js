$(function () {
    $("#generate-lists").click(function () {
        $(".results").addClass("d-none");
        $("#loading-gif").removeClass("d-none");

        const worker = new Worker("aco-worker.js");
        worker.onmessage = function (event) {
            $("#aco-score").text(event.data.antScore);
            $("#random-score").text(event.data.randomScore);
            $("#fraction-result").text(Math.round(100 *
                (event.data.randomScore - event.data.antScore) / event.data.randomScore
            ) + "%");
            updateGenerationChart(event.data.generationScores);
            $("#loading-gif").addClass("d-none");
            $(".results").removeClass("d-none");
        };
    });
});

function updateGenerationChart(generationScores) {
    var ctx = document.getElementById("generationChart").getContext('2d');
    ctx.width = 400;
    ctx.height = 400;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from(new Array(generationScores.length), function (x, i) {return i;}),
            datasets: [{
                label: "Generations",
                backgroundColor: "blue",
                borderColor: "blue",
                data: generationScores,
                fill: false
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Score per Generation'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Generation'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Score'
                    },
                    ticks: {
                        min: 0
                    }
                }]
            }
        }
    });
}
