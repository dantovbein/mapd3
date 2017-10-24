import * as d3 from "./helpers/d3-service"

import {override} from "./helpers/common"

export default function DomainEditor (_container) {

  let config = {
    margin: {
      top: 60,
      right: 30,
      bottom: 40,
      left: 70
    },
    width: 800,
    height: 500
  }

  const cache = {
    container: _container,
    root: null,
    xHitZone: null,
    yHitZone: null,
    y2HitZone: null,
    yMaxInput: null,
    yMinInput: null,
    yLockIcon: null,
    y2MaxInput: null,
    y2MinInput: null,
    y2LockIcon: null,
    xMinInput: null,
    xMaxInput: null,
    xLockIcon: null,
    chartWidth: null,
    chartHeight: null,
    xDomain: null,
    yDomain: null,
    y2Domain: null
  }

  // events
  const dispatcher = d3.dispatch("domainChanged", "domainLockToggled")

  function buildSVG () {
    cache.chartWidth = config.width - config.margin.left - config.margin.right
    cache.chartHeight = config.height - config.margin.top - config.margin.bottom

    if (!cache.root) {
      cache.root = cache.container
          .append("div")
          .attr("class", "domain-input-group")
          .style("position", "absolute")
          .style("top", 0)

      // hit zones
      cache.xHitZone = cache.root.append("div")
          .attr("class", "hit-zone x")
          .style("pointer-events", "all")
          .style("position", "absolute")
          .on("mouseover.dispatch", showXEditor)
          .on("mouseout.dispatch", hideXEditor)

      cache.yHitZone = cache.root.append("div")
          .attr("class", "hit-zone y")
          .style("pointer-events", "all")
          .style("position", "absolute")
          .on("mouseover.dispatch", showYEditor)
          .on("mouseout.dispatch", hideYEditor)

      cache.y2HitZone = cache.root.append("div")
          .attr("class", "hit-zone y2")
          .style("pointer-events", "all")
          .style("position", "absolute")
          .on("mouseover.dispatch", showY2Editor)
          .on("mouseout.dispatch", hideY2Editor)

      // y input group
      cache.yMaxInput = cache.yHitZone.append("input")
        .attr("class", "domain-input y max")
        .style("position", "absolute")
        .on("change", function change () {
          dispatcher.call("domainChanged", this, {value: this.value, axis: "y", type: "max"})
        })

      cache.yMinInput = cache.yHitZone.append("input")
        .attr("class", "domain-input y min")
        .style("position", "absolute")
        .on("change", function change () {
          dispatcher.call("domainChanged", this, {value: this.value, axis: "y", type: "min"})
        })

      cache.yLockIcon = cache.yHitZone.append("div")
        .attr("class", "domain-lock y")
        .style("position", "absolute")
        .on("click", function change () {
          const isLocked = this.classList.contains("locked")
          this.classList.toggle("locked", !isLocked)
          dispatcher.call("domainLockToggled", this, {isLocked: !isLocked, axis: "y"})
        })

      // y2 input group
      cache.y2MaxInput = cache.y2HitZone.append("input")
        .attr("class", "domain-input y2 max")
        .style("position", "absolute")
        .on("change", function change () {
          dispatcher.call("domainChanged", this, {value: this.value, axis: "y2", type: "max"})
        })

      cache.y2MinInput = cache.y2HitZone.append("input")
        .attr("class", "domain-input y2 min")
        .style("position", "absolute")
        .on("change", function change () {
          dispatcher.call("domainChanged", this, {value: this.value, axis: "y2", type: "min"})
        })

      cache.y2LockIcon = cache.y2HitZone.append("div")
        .attr("class", "domain-lock y2")
        .style("position", "absolute")
        .on("click", function change () {
          const isLocked = this.classList.contains("locked")
          this.classList.toggle("locked", !isLocked)
          dispatcher.call("domainLockToggled", this, {isLocked: !isLocked, axis: "y2"})
        })

      // x input group
      cache.xMinInput = cache.xHitZone.append("input")
        .attr("class", "domain-input x min")
        .style("position", "absolute")
        .on("change", function change () {
          dispatcher.call("domainChanged", this, {value: this.value, axis: "x", type: "min"})
        })

      cache.xMaxInput = cache.xHitZone.append("input")
        .attr("class", "domain-input x max")
        .style("position", "absolute")
        .on("change", function change () {
          dispatcher.call("domainChanged", this, {value: this.value, axis: "x", type: "max"})
        })

      cache.xLockIcon = cache.xHitZone.append("div")
        .attr("class", "domain-lock x")
        .style("position", "absolute")
        .on("click", function change () {
          const isLocked = this.classList.contains("locked")
          this.classList.toggle("locked", !isLocked)
          dispatcher.call("domainLockToggled", this, {isLocked: !isLocked, axis: "x"})
        })

      hideYEditor()
      hideY2Editor()
      hideXEditor()
    }

    const HOVER_ZONE_SIZE = 40
    const LOCK_SIZE = 12
    const INPUT_HEIGHT = 12
    const PADDING = 4
    const INPUT_WIDTH = HOVER_ZONE_SIZE - PADDING

    cache.xHitZone.style("width", `${cache.chartWidth + HOVER_ZONE_SIZE * 2}px`)
      .style("height", `${HOVER_ZONE_SIZE}px`)
      .style("top", `${config.margin.top + cache.chartHeight}px`)
      .style("left", `${config.margin.left - HOVER_ZONE_SIZE}px`)

    cache.yHitZone.style("width", `${HOVER_ZONE_SIZE}px`)
      .style("height", `${cache.chartHeight + HOVER_ZONE_SIZE}px`)
      .style("top", `${config.margin.top - HOVER_ZONE_SIZE}px`)
      .style("left", `${config.margin.left - HOVER_ZONE_SIZE}px`)

    cache.y2HitZone.style("width", `${HOVER_ZONE_SIZE}px`)
      .style("height", `${cache.chartHeight + HOVER_ZONE_SIZE}px`)
      .style("top", `${config.margin.top - HOVER_ZONE_SIZE}px`)
      .style("left", `${config.margin.left + cache.chartWidth}px`)

    cache.yMaxInput.style("width", `${INPUT_WIDTH}px`)
      .style("height", `${INPUT_HEIGHT}px`)
      .style("top", `${HOVER_ZONE_SIZE}px`)
      .property("value", Array.isArray(cache.yDomain)
          && !isNaN(cache.yDomain[1]) ? cache.yDomain[1] : "")

    cache.yMinInput.style("width", `${INPUT_WIDTH}px`)
      .style("height", `${INPUT_HEIGHT}px`)
      .style("top", `${cache.chartHeight + HOVER_ZONE_SIZE - INPUT_HEIGHT}px`)
      .property("value", Array.isArray(cache.yDomain)
            && !isNaN(cache.yDomain[0]) ? cache.yDomain[0] : "")

    cache.yLockIcon.style("width", `${LOCK_SIZE}px`)
      .style("height", `${LOCK_SIZE}px`)
      .style("left", `${HOVER_ZONE_SIZE - LOCK_SIZE}px`)
      .style("top", `${HOVER_ZONE_SIZE - LOCK_SIZE}px`)

    cache.y2MaxInput.style("width", `${INPUT_WIDTH}px`)
      .style("height", `${INPUT_HEIGHT}px`)
      .style("top", `${HOVER_ZONE_SIZE}px`)
      .style("left", `${PADDING}px`)
      .property("value", Array.isArray(cache.y2Domain)
          && !isNaN(cache.y2Domain[1]) ? cache.y2Domain[1] : "")

    cache.y2MinInput.style("width", `${INPUT_WIDTH}px`)
      .style("height", `${INPUT_HEIGHT}px`)
      .style("top", `${cache.chartHeight + HOVER_ZONE_SIZE - INPUT_HEIGHT}px`)
      .style("left", `${PADDING}px`)
      .property("value", Array.isArray(cache.y2Domain)
          && !isNaN(cache.y2Domain[0]) ? cache.y2Domain[0] : "")

    cache.y2LockIcon.style("width", `${LOCK_SIZE}px`)
      .style("height", `${LOCK_SIZE}px`)
      .style("top", `${HOVER_ZONE_SIZE - LOCK_SIZE}px`)

    cache.xMinInput.style("width", `${INPUT_WIDTH}px`)
      .style("height", `${INPUT_HEIGHT}px`)
      .style("top", `${PADDING}px`)
      .style("left", `${HOVER_ZONE_SIZE}px`)
      .property("value", Array.isArray(cache.xDomain)
          && typeof (cache.xDomain[0]) !== "undefined" ? cache.xDomain[0] : "")

    cache.xMaxInput.style("width", `${INPUT_WIDTH}px`)
      .style("height", `${INPUT_HEIGHT}px`)
      .style("top", `${PADDING}px`)
      .style("left", `${HOVER_ZONE_SIZE + cache.chartWidth - INPUT_WIDTH}px`)
      .property("value", Array.isArray(cache.xDomain)
          && typeof (cache.xDomain[1]) !== "undefined" ? cache.xDomain[1] : "")

    cache.xLockIcon.style("width", `${LOCK_SIZE}px`)
      .style("height", `${LOCK_SIZE}px`)
      .style("left", `${HOVER_ZONE_SIZE + cache.chartWidth}px`)
  }

  function showYEditor () {
    cache.yHitZone.style("opacity", "1")
  }

  function hideYEditor () {
    cache.yHitZone.style("opacity", "0")
  }

  function showY2Editor () {
    cache.y2HitZone.style("opacity", "1")
  }

  function hideY2Editor () {
    cache.y2HitZone.style("opacity", "0")
  }

  function showXEditor () {
    cache.xHitZone.style("opacity", "1")
  }

  function hideXEditor () {
    cache.xHitZone.style("opacity", "0")
  }

  function drawDomainEditor () {
    buildSVG()
    return this
  }

  function on (...args) {
    return dispatcher.on(...args)
  }

  function setXDomain (_xDomain) {
    cache.xDomain = _xDomain
    return this
  }

  function setYDomain (_yDomain) {
    cache.yDomain = _yDomain
    return this
  }

  function setY2Domain (_y2Domain) {
    cache.y2Domain = _y2Domain
    return this
  }

  function setXLock (_xLock) {
    cache.xLock = _xLock
    return this
  }

  function setYLock (_yLock) {
    cache.yLock = _yLock
    return this
  }

  function setY2Lock (_y2Lock) {
    cache.y2Lock = _y2Lock
    return this
  }

  function setConfig (_config) {
    config = override(config, _config)
    return this
  }

  return {
    on,
    setConfig,
    setXDomain,
    setYDomain,
    setY2Domain,
    setXLock,
    setYLock,
    setY2Lock,
    drawDomainEditor
  }
}
