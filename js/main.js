/*
* Gapminder Clone
*/
var points
var x
var y
let xLabel
let yLabel
let timeLabel
let pop
let xAxisGroup
let yAxisGroup
let xAxisCall
let yAxisCall
let continents
let legend
let tip
let globalData
let interval
let playFunc
let i = 0
let g

const margin = { left:80, right:20, top:50, bottom:100 };

const width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

g = d3.select("#chart-area")
		.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", `translate(${margin.left}, ${margin.top})`)

d3.json("data/data.json").then(function(data){
	
	//Clean the Data
	data.forEach(yearGroup =>{
		yearGroup.countries = yearGroup.countries.filter(element => {
			for (let key in element){
				if(!element[key]){
					return false
				}
			}
			return true
		})
	})
	
	//Make the numbers numbers
	data.forEach(yearGroup =>{
		yearGroup.countries.forEach(d => {
			d.income = +d.income
			d.life_exp = +d.life_exp
			d.population = +d.population
		})
	})

	globalData = data

	//Set Initails
	init()

	//Set Event Listeners
	setEventListeners()

	//Set up tool tips
	toolTipGenerator()

	//Initial Update
	update(globalData[i].countries, globalData[i].year)

	//Draw Legend
	drawLegend()
	
	//Set the Update Interval
	

})

function setEventListeners(){

	$("#play-button").on('click', function(){
		let button = $(this)
		if($(this).text() === 'Play'){
			interval = setInterval(playFunc, 100)
			$(this).text("Pause")
		} else {
			$(this).text("Play")
			clearInterval(interval)
		}
	})

	$("#reset-button").on('click', function(){
		i = 0
		update(globalData[i].countries, globalData[i].year)
	})

	$("#continent-select").on('change', function(){
		update(globalData[i].countries, globalData[i].year)
	})
}

function init(){
	playFunc = () => {
		if (i >= globalData.length - 1){
			i = 0
		}
		let newData = globalData[++i]
		update(newData.countries, newData.year)
    }

	// X Label
	g.append("text")
	.attr("y", height + 50)
	.attr("x", width / 2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("GDP Per Capita (USD)");

	// Y Label
	yLabel = g.append("text")
	.attr("y", -60)
	.attr("x", -(height / 2))
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Life Expectancy (Years)");

	// Time Label
	timeLabel = g.append("text")
    .attr("y", height -10)
    .attr("x", width - 40)
    .attr("font-size", "30px")
    .attr("opacity", "0.4")
    .attr("text-anchor", "end")
	.text("1800");

	//Population Scale
	pop = d3.scaleLinear()
			.range([25 * Math.PI, 1500 * Math.PI])
			.domain([2000, 1400000000])
	
	xAxisGroup = g.append("g")
		.attr("class", "x axis")
		.attr("transform", `translate(0, ${height})`)

	yAxisGroup = g.append("g")
		.attr("class", "y axis");

	// Set X Scale
	x = d3.scaleLog()
		.base(10)
		.range([0, width])
		.domain([150, 150000])

	// Set Y Scale		
	y = d3.scaleLinear()
		.range([height, 0])
		.domain([0, 90])

	continentColor = d3.scaleOrdinal(d3.schemeSet1)

	yAxisCall = d3.axisLeft(y)
		.ticks(10)
		
	xAxisCall = d3.axisBottom(x)
		.tickValues([400, 4000, 40000])
		.tickFormat(d3.format("$"))
}

function update(data, year){

	let selectedContinent = $("#continent-select").val()

	data = data.filter(element => {
		if(selectedContinent === "all"){
			return true
		} else {
			 return element.continent == selectedContinent
		}
	})
	let t = d3.transition().duration(10)

	points = g.selectAll("circle")
		.data(data, d => d.country)

	points.exit()
		.attr("class", "exit")
		.remove()

	points.enter()
		.append("circle")
		.attr("class", "enter")
		.attr("fill", d => continentColor(d.continent))
		.attr("opacity", .7)
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide)
		.merge(points)
		.transition(t)
			.attr("cy", d => y(d.life_exp))
			.attr("cx", d => x(d.income))
			.attr("r", d => Math.sqrt(pop(d.population) / Math.PI))

	yAxisGroup.call(yAxisCall);
	xAxisGroup.call(xAxisCall);
	timeLabel.text(`Year ${year}`)
}

function drawLegend(){
	continents = ["europe", "asia", "americas", "africa"]

	legend = g.append("g")
		.attr("transform", `translate(${width - 10}, ${height - 125})`)

	continents.forEach((continent, i) =>{

		legendRow = legend.append("g")
			.attr("transform", `translate(0, ${i * 20})`)

		legendRow.append("rect")
			.attr("width", 10)
			.attr("height", 10)
			.attr("fill", continentColor(continent))
		
		legendRow.append("text")
			.attr("x", -10)
			.attr("y", 10)
			.attr("text-anchor", "end")
			.style("text-transform", "capitalize")
			.text(continent)
	})
}

function toolTipGenerator(){
	tip = d3.tip().attr('class', 'd3-tip')
	.html(d =>{
		let text = `<strong>Country:</strong> ${d.country} <br>`
		text += `<strong>Population:</strong> ${d3.format(",.0f")(d.population)} <br>`
		text += `<strong>Life Expectancy:</strong> ${d3.format(".0f")(d.life_exp)} years<br>`
		text += `<strong>GDP Per Capita:</strong> ${d3.format("$,.0f")(d.income)} <br>`
		return text
	})
	g.call(tip)
}

