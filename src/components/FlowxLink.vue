<template>
  <g
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @mousedown="$emit('mousedown', $event)"
  >
    <path :d="curve" :style="largeStrokeStyle" stroke-width="8" fill="none"/>
    <path
      :id="link.id"
      :d="curve"
      :style="linkStyle"
      :class="linkClass"
      stroke-width="2"
      fill="none"
    />
    <!--    <rect-->
    <!--      :id="link.id"-->
    <!--      :width="link.title.length * 3 + 8" :height="10"-->
    <!--      :style="linkStyle"-->
    <!--      :x="rectX"-->
    <!--      :y="rectY"-->
    <!--      stroke-width="2"-->
    <!--      fill="#fff"-->
    <!--    />-->
    <text
      :id="link.id"
      :x="rectX + 2"
      :y="rectY + 8"
      fill="none"
      font-size="8"
      text-anchor="middle"
      :class="linkTextClass"
    >
      {{ link.title }}
    </text>
  </g>
</template>
<script>
import Link from "../models/Link";
import Node from "../models/Node";

export default {
  name: "FlowxLink",
  props: {
    link: {type: Link, required: true},
    nodeStart: {type: Node, required: true},
    nodeEnd: {type: Node, required: true},
    selected: {type: Boolean, default: false},
  },

  data: () => ({
    hovered: false,
  }),

  computed: {
    startCoordinates() {
      return this.nodeStart.getPortCoordinates("out", this.link.start_port);
    },
    endCoordinates() {
      return this.nodeEnd.getPortCoordinates("in", this.link.end_port);
    },
    x1() {
      return this.startCoordinates.x - 2;
    },
    y1() {
      return this.startCoordinates.y;
    },
    x2() {
      return this.endCoordinates.x + 1;
    },
    y2() {
      return this.endCoordinates.y;
    },
    curve() {
      let x1 = Math.trunc(this.x1),
        y1 = Math.trunc(this.y1),
        x2 = Math.trunc(this.x2),
        y2 = Math.trunc(this.y2);

      let distance = Math.trunc(4 * Math.sqrt(Math.abs(x1 - x2))) + 10;
      return `M${x1},${y1} C${x1 + distance},${y1} ${
        x2 - distance
      },${y2} ${x2},${y2}`;
    },
    largeStrokeStyle() {
      if (this.selected) {
        return this.hovered
          ? "stroke:rgba(0,0,255,0.6);"
          : "stroke:rgba(0,0,255,0.4);";
      }
      return this.hovered
        ? "stroke:rgba(255,0,0,0.5);"
        : "stroke:rgba(255,0,0,0.0);";
    },
    linkStyle() {
      if (this.link.is_dark) {
        return {stroke: 'rgb(0,0,0)'};
      }
      return {stroke: 'rgb(255,255,255)'};
    },
    linkClass() {
      if (this.link.animated) {
        if (this.link.inverted_flow) {
          return "flowx-editor__animated1";
        }
        return "flowx-editor__animated0";
      }
      return "";
    },
    rectX() {
      return this.startCoordinates.x + ((this.endCoordinates.x + 1) - (this.startCoordinates.x - 2)) * 0.50;
    },
    rectY() {
      return this.startCoordinates.y + (this.endCoordinates.y - this.startCoordinates.y) * 0.50;
    },
    linkTextClass() {
      if (this.link.is_dark) {
        return "flowx-editor__link1";
      }
      return "flowx-editor__link0" ;
    }
  },
};
</script>
