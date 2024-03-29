var RadarChart = {
    draw: function (id, d, options) {
        var cfg = {
            radius: 5,
            w: 600,
            h: 600,
            factor: 1,
            factorLegend: 1.1,
            levels: 3,
            maxValue: 0,
            radians: 2 * Math.PI,
            ToRight: 5,
            TranslateX: 100,
            TranslateY: 100,
            ExtraWidthX: 200,
            ExtraWidthY: 200,
            // フォントサイズ
            fontSize: "14px",
            // 軸の単位を表示するか
            showAxisValue: false,
            // 軸の単位
            axisUnit: "",
            // 軸の色
            asxisColor: "#e3e2fe",
            // 線の幅
            strokeWidth: "2px",
            // 線の色
            strokeColor: "#e3e2fe",
            // 塗りつぶしの色
            fillColor: "#e3e2fe",
            // 塗りつぶしの透過
            opacityArea: 0.2,
            // グラフのlevelsの色
            levelsColor: "#c9caca",
            mouseover: function () {},
            mouseout: function () {},
            // 頂点の色
            pointColor: "none",
            // 頂点の透過
            pointOpacity: 0.9,
            pointMouseover: function (d) {},
            pointMouseout: function (d) {},
            // グラフを丸くする
            roundStrokes: false,
            // グラフの傾き
            rotate: 0,
            // legendの表示
            legendShow: true,
            // legendの背景の幅
            legendXpad: 23,
            // legendの背景の高さ
            legendYpad: 17,
        };

        if ("undefined" !== typeof options) {
            for (var i in options) {
                if ("undefined" !== typeof options[i]) {
                    cfg[i] = options[i];
                }
            }
        }
        cfg.maxValue = Math.max(
            cfg.maxValue,
            d3.max(d, function (i) {
                return d3.max(
                    i.map(function (o) {
                        return o.value;
                    })
                );
            })
        );
        var allAxis = d[0].map(function (i, j) {
            return i.axis;
        });
        var total = allAxis.length;
        var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
        d3.select(id).select("svg").remove();

        var g = d3
            .select(id)
            .append("svg")
            .attr("width", cfg.w + cfg.ExtraWidthX)
            .attr("height", cfg.h + cfg.ExtraWidthY)
            .attr("transform", "rotate(" + cfg.rotate + ")")
            .append("g")
            .attr(
                "transform",
                "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")"
            );
        var tooltip;
        if (cfg.roundStrokes) {
            // Circular segments
            for (var j = 0; j < cfg.levels; j++) {
                g.selectAll(".levels")
                    .data([1])
                    .enter()
                    .append("svg:circle")
                    .attr("class", "circle")
                    .attr("cy", cfg.h / 2)
                    .attr("cx", cfg.w / 2)
                    .attr(
                        "r",
                        ((cfg.w / cfg.levels) * (cfg.levels - 1 - j + 1)) / 2
                    )
                    .style("stroke", cfg.levelsColor)
                    .style("stroke-opacity", "1")
                    .style("stroke-width", "0.3px")
                    .style("fill", "#fff");
            }
        } else {
            // Circular segments
            for (var j = 0; j < cfg.levels; j++) {
                var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
                g.selectAll(".levels")
                    .data(allAxis)
                    .enter()
                    .append("svg:line")
                    .attr("x1", function (d, i) {
                        return (
                            levelFactor *
                            (1 -
                                cfg.factor *
                                    Math.sin((i * cfg.radians) / total))
                        );
                    })
                    .attr("y1", function (d, i) {
                        return (
                            levelFactor *
                            (1 -
                                cfg.factor *
                                    Math.cos((i * cfg.radians) / total))
                        );
                    })
                    .attr("x2", function (d, i) {
                        return (
                            levelFactor *
                            (1 -
                                cfg.factor *
                                    Math.sin(((i + 1) * cfg.radians) / total))
                        );
                    })
                    .attr("y2", function (d, i) {
                        return (
                            levelFactor *
                            (1 -
                                cfg.factor *
                                    Math.cos(((i + 1) * cfg.radians) / total))
                        );
                    })
                    .attr("class", "line")
                    .style("stroke", cfg.levelsColor)
                    .style("stroke-opacity", "1")
                    .style("stroke-width", "0.3px")
                    .attr(
                        "transform",
                        "translate(" +
                            (cfg.w / 2 - levelFactor) +
                            ", " +
                            (cfg.h / 2 - levelFactor) +
                            ")"
                    );
            }
        }

        //Text indicating at what % each level is
        for (var j = 0; j < cfg.levels; j++) {
            var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
            var axisValue = (((j + 1) * cfg.maxValue) / cfg.levels) * 100;
            g.selectAll(".levels")
                .data([1]) //dummy data
                .enter()
                .append("svg:text")
                .attr("x", function (d) {
                    return levelFactor * (1 - cfg.factor * Math.sin(0));
                })
                .attr("y", function (d) {
                    return levelFactor * (1 - cfg.factor * Math.cos(0));
                })
                .attr("class", "legend")
                .style("font-family", "sans-serif")
                .style("font-size", "10px")
                .style("font-weight", "500")
                .attr(
                    "transform",
                    "translate(" +
                        (cfg.w / 2 - levelFactor + cfg.ToRight) +
                        ", " +
                        (cfg.h / 2 - levelFactor) +
                        ")"
                )
                .attr("fill", cfg.asxisColor)
                .text(cfg.showAxisValue ? axisValue + cfg.axisUnit : "");
        }

        series = 0;

        var axis = g
            .selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");

        axis.append("line")
            .attr("x1", cfg.w / 2)
            .attr("y1", cfg.h / 2)
            .attr("x2", function (d, i) {
                return (
                    (cfg.w / 2) *
                    (1 - cfg.factor * Math.sin((i * cfg.radians) / total))
                );
            })
            .attr("y2", function (d, i) {
                return (
                    (cfg.h / 2) *
                    (1 - cfg.factor * Math.cos((i * cfg.radians) / total))
                );
            })
            .attr("class", "line")
            .style("stroke", cfg.asxisColor)
            .style("stroke-width", "1px");

        if (cfg.legendShow) {
            var legendXsize =
                d.length > 4 ? d.length * cfg.legendXpad : 4 * cfg.legendXpad;
            axis.append("svg:rect")
                .attr(
                    "height",
                    parseInt(cfg.fontSize.replace("px", "")) +
                        cfg.legendYpad +
                        "px"
                )
                .style("width", legendXsize)
                .attr("transform", function (d, i) {
                    return "translate(0, -10)";
                })
                .style("fill", function (d, i) {
                    if (i == 0) {
                        return "#ec6d56";
                    }
                    if (i == 1) {
                        return "#ba79b1";
                    }
                    if (i == 2) {
                        return "#f19db5";
                    }
                    if (i == 3) {
                        return "#fbc93e";
                    }
                    if (i == 4) {
                        return "#64b6c8";
                    }
                    if (i == 5) {
                        return "#74c080";
                    }
                    if (i == 6) {
                        return "#718cc7";
                    }
                })
                .attr("rx", cfg.legendXpad * 0.8)
                .attr("ry", cfg.legendXpad * 0.8)
                .attr("x", function (d, i) {
                    return (
                        (cfg.w / 2) *
                            (1 - Math.sin((i * cfg.radians) / total)) -
                        60 * Math.sin((i * cfg.radians) / total) -
                        legendXsize / 2
                    );
                })
                .attr("y", function (d, i) {
                    return (
                        (cfg.h / 2) *
                            (1 -
                                cfg.factorLegend *
                                    Math.cos((i * cfg.radians) / total)) -
                        20 * Math.cos((i * cfg.radians) / total) +
                        -cfg.legendYpad / 2
                    );
                });
            axis.append("text")
                .attr("class", "legend")
                .text(function (d) {
                    return d;
                })
                .style("font-family", "sans-serif")
                .style("font-size", cfg.fontSize)
                .attr("text-anchor", "middle")
                .attr("dy", "1.0em")
                .attr("transform", function (d, i) {
                    return "translate(0, -10)";
                })
                .style("transform-origin", "center")
                .style("fill", "#fff")
                .attr("x", function (d, i) {
                    return (
                        (cfg.w / 2) *
                            (1 - Math.sin((i * cfg.radians) / total)) -
                        60 * Math.sin((i * cfg.radians) / total)
                    );
                })
                .attr("y", function (d, i) {
                    return (
                        (cfg.h / 2) *
                            (1 -
                                cfg.factorLegend *
                                    Math.cos((i * cfg.radians) / total)) -
                        20 * Math.cos((i * cfg.radians) / total)
                    );
                });
        }

        // レーダーチャート内の設定
        d.forEach(function (y, x) {
            dataValues = [];
            g.selectAll(".nodes").data(y, function (j, i) {
                dataValues.push([
                    (cfg.w / 2) *
                        (1 -
                            (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) *
                                cfg.factor *
                                Math.sin((i * cfg.radians) / total)),
                    (cfg.h / 2) *
                        (1 -
                            (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) *
                                cfg.factor *
                                Math.cos((i * cfg.radians) / total)),
                ]);
            });
            dataValues.push(dataValues[0]);
            g.selectAll(".area")
                .data([dataValues])
                .enter()
                .append("polygon")
                .attr("class", "radar-chart-serie" + series)
                .style("stroke-width", cfg.strokeWidth)
                .style("stroke", cfg.strokeColor)
                .attr("points", function (d) {
                    var str = "";
                    for (var pti = 0; pti < d.length; pti++) {
                        str = str + d[pti][0] + "," + d[pti][1] + " ";
                    }
                    return str;
                })
                .style("fill", cfg.fillColor)
                .style("fill-opacity", cfg.opacityArea)
                .on("mouseover", cfg.mouseover)
                .on("mouseout", cfg.mouseout);
            series++;
        });
        series = 0;

        // 頂点の設定
        d.forEach(function (y, x) {
            g.selectAll(".nodes")
                .data(y)
                .enter()
                .append("svg:circle")
                .attr("class", "radar-chart-serie" + series)
                .attr("r", cfg.radius)
                .attr("alt", function (j) {
                    return Math.max(j.value, 0);
                })
                .attr("cx", function (j, i) {
                    dataValues.push([
                        (cfg.w / 2) *
                            (1 -
                                (parseFloat(Math.max(j.value, 0)) /
                                    cfg.maxValue) *
                                    cfg.factor *
                                    Math.sin((i * cfg.radians) / total)),
                        (cfg.h / 2) *
                            (1 -
                                (parseFloat(Math.max(j.value, 0)) /
                                    cfg.maxValue) *
                                    cfg.factor *
                                    Math.cos((i * cfg.radians) / total)),
                    ]);
                    return (
                        (cfg.w / 2) *
                        (1 -
                            (Math.max(j.value, 0) / cfg.maxValue) *
                                cfg.factor *
                                Math.sin((i * cfg.radians) / total))
                    );
                })
                .attr("cy", function (j, i) {
                    return (
                        (cfg.h / 2) *
                        (1 -
                            (Math.max(j.value, 0) / cfg.maxValue) *
                                cfg.factor *
                                Math.cos((i * cfg.radians) / total))
                    );
                })
                .attr("data-id", function (j) {
                    return j.axis;
                })
                .style("fill", cfg.pointColor)
                .style("fill-opacity", cfg.pointOpacity)
                .on("mouseover", cfg.pointMouseover)
                .on("mouseout", cfg.pointMouseout);

            series++;
        });
        //Tooltip
        tooltip = g
            .append("text")
            .style("opacity", 0)
            .style("font-family", "sans-serif")
            .style("font-size", "13px");
    },
};
