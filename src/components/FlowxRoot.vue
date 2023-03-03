<template>
  <svg
    :id="`flowx-root-${uniqId}`"
    ref="flowxRoot"
    xmlns="http://www.w3.org/2000/svg"
    :viewBox.camel="'0 0 ' + width / 1.2 + ' ' + height / 1.2"
    :width="width"
    :height="height"
    preserveAspectRatio="xMinYMin meet"
    class="flowx-editor__svg-content"
  >
    <g ref="viewPort" class="svg-pan-zoom_viewport" x="50" y="50">
      <defs>
        <pattern
          :id="`flowx-small-grid-${uniqId}`"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 16 0 L 0 0 0 16"
            fill="none"
            stroke="#81818a"
            stroke-width="0.5"
          />
        </pattern>
        <pattern
          :id="`flowx-grid-square-${uniqId}`"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <rect
            width="80"
            height="80"
            :fill="`url(#flowx-small-grid-${uniqId})`"
          />
          <path
            d="M 80 0 L 0 0 0 80"
            fill="none"
            stroke="#81818a"
            stroke-width="1"
          />
        </pattern>
        <pattern
          :id="`flowx-grid-dot-${uniqId}`"
          :x="xOffSet"
          :y="yOffSet"
          :width="scaledGap"
          :height="scaledGap"
          patternUnits="userSpaceOnUse"
        >
          <template>
            <circle :cx="size" :cy="size" :r="size" fill="#81818a" />
          </template>
        </pattern>
      </defs>

      <rect
        ref="grid"
        x="-5000px"
        y="-5000px"
        width="10000px"
        height="10000px"
        :fill="
          bgPattern > 0
            ? `url(#flowx-grid-square-${uniqId})`
            : `url(#flowx-grid-dot-${uniqId})`
        "
        @mousedown="clearSelection"
      />

      <FlowxLink
        v-for="link in links"
        :id="link.id"
        :key="link.id"
        :link="link"
        :node-start="nodes[link.start_id]"
        :node-end="nodes[link.end_id]"
        :selected="selectedLink === link.id"
        @mousedown="selectLink(link.id)"
      />
      <FlowxNode
        v-for="node in nodes"
        :key="node.id"
        :node="node"
        :color="nodeColor"
        :pulse-color="nodePulseColor"
        :pulsable="nodePulsable"
        :deletable="nodeDeletable"
        :dragging="draggedNode === node.id"
        :selected="selectedNode === node.id"
        :port-disabled="portDisabled"
        :port-available="portAvailable"
        :active-port="activePort"
        :hovered-port="hoveredPort"
        @delete="deleteNode"
        @drag-start="onNodeDragStart"
        @resize-start="onNodeResizeStart"
        @hovered-port="setHoveredPort"
        @active-port="setActivePort"
      >
        <template #default="scopedParams">
          <slot v-bind="scopedParams" :node="node" />
        </template>
      </FlowxNode>
      <line
        v-if="newLink"
        :x1="newLink.x1"
        :y1="newLink.y1"
        :x2="newLink.x2"
        :y2="newLink.y2"
        style="stroke: rgb(255, 0, 0); stroke-width: 2"
        pointer-events="none"
      />
    </g>
  </svg>
</template>

<script>
import FlowxNode from "./FlowxNode";
import FlowxLink from "./FlowxLink";
import FlowxEditorMixin from "../mixins/FlowxEditorMixin";
import SvgPanZoomMixin from "../mixins/SvgPanZoomMixin";
import { getAbsoluteXY } from "../helpers";
import { ulid } from "ulid";

export default {
  name: "FlowxRoot",
  components: {
    FlowxNode,
    FlowxLink,
  },
  mixins: [FlowxEditorMixin(), SvgPanZoomMixin()],
  props: {
    bgPattern: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, required: true },
    gridSnap: { type: Number, required: true },
    zoomEnabled: { type: Boolean, required: true },
    nodeColor: { type: Function, required: true },
    nodePulseColor: { type: Function, required: true },
    nodePulsable: { type: Function, required: true },
    nodeDeletable: { type: Function, required: true },
    beforeDeleteNode: { type: Function, required: true },
    beforeDeleteLink: { type: Function, required: true },
    portDisabled: { type: Function, required: true },
    portAvailable: { type: Function, required: true },
    pan: { type: Boolean, required: true },
    preventMouseEventsDefault: { type: Boolean, default: true },
  },
  data() {
    return {
      scaledGap: 10,
      xOffSet: 10,
      yOffSet: 10,
      size: 0.5,
      d: `M${5} 0 V${10} M0 ${5} H${10}`,
    };
  },
  computed: {
    uniqId() {
      return ulid();
    },
  },
  mounted() {
    document.addEventListener("keydown", this.keyDownHandler);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.keyDownHandler);
  },
  methods: {
    keyDownHandler(e) {
      // delete
      if (e.keyCode === 46) {
        if (
          this.selectedNode &&
          this.nodeDeletable(this.nodes[this.selectedNode])
        ) {
          this.deleteNode(this.selectedNode);
        }
        if (this.selectedLink) {
          this.deleteLink(this.selectedLink);
        }
      }
      // esc
      if (e.keyCode === 27) {
        this.clearSelection();
      }
    },

    convertXYtoViewPort(x, y) {
      const root = this.$refs.flowxRoot;
      const viewport = this.$refs.viewPort;
      let point = root.createSVGPoint();
      let rootPosition = getAbsoluteXY(root);
      point.x = x - rootPosition.x;
      point.y = y - rootPosition.y;
      let ctm = viewport.getCTM().inverse();
      return point.matrixTransform(ctm);
    },

    onNodeDragStart({ node, eX, eY }) {
      const { x, y } = this.convertXYtoViewPort(eX, eY);
      this.dragStart({
        type: "drag",
        id: node.id,
        offset: {
          x: Math.round(x - node.x),
          y: Math.round(y - node.y),
        },
      });
    },

    onNodeResizeStart({ node, eX, eY }) {
      const { x, y } = this.convertXYtoViewPort(eX, eY);
      this.dragStart({
        type: "resize",
        id: node.id,
        offset: {
          x: -Math.round(node.x + node.width - x),
          y: -Math.round(node.y + node.height - y),
        },
      });
    },

    setActivePort(port) {
      this.activePort = port;
    },

    setHoveredPort(port) {
      this.hoveredPort = port;
    },
  },
};
</script>
