<template>
  <div class="flowx-editor__wrapper">
    <FlowxRoot
      ref="flowx"
      :bg-pattern="bgPattern"
      :width="width"
      :height="height"
      :grid-snap="gridSnap"
      :zoom-enabled="zoomEnabled"
      :node-color="nodeColor"
      :node-is-pulse="nodePulsable"
      :node-deletable="nodeDeletable"
      :node-pulse-color="nodePulseColor"
      :before-delete-node="beforeDeleteNode"
      :before-delete-link="beforeDeleteLink"
      :port-disabled="portDisabled"
      :port-available="portAvailable"
      :pan="pan"
      :prevent-mouse-events-default="preventMouseEventsDefault"
      @select-node="$emit('select-node', $event)"
      @deleted-node="$emit('deleted-node', $event)"
      @updated-node="$emit('updated-node', $event)"
      @created-link="$emit('created-link', $event)"
      @deleted-link="$emit('deleted-link', $event)"
      @select-link="$emit('select-link', $event)"
      @click-port="$emit('click-port', $event)"
      @clear-selection="$emit('clear-selection', $event)"
    >
      <template #default="scopedParams">
        <slot name="node" v-bind="scopedParams" />
      </template>
    </FlowxRoot>
  </div>
</template>
<script>
import throttle from "lodash/throttle";

const components = {
  FlowxRoot: () => import("../components/FlowxRoot.vue")
};

export default {
  name: "Flowx",
  components,
  props: {
    bgPattern:{
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 500,
    },
    gridSnap: {
      type: Number,
      default: 1,
    },
    zoomEnabled: {
      type: Boolean,
      default: true,
    },
    nodeColor: {
      type: Function,
      default: () => "#66cc00",
    },
    nodePulseColor: {
      type: Function,
      default: () => "#f00",
    },
    nodePulsable: {
      type: Function,
      default: () => false,
    },
    nodeDeletable: {
      type: Function,
      default: () => true,
    },
    beforeDeleteNode: {
      type: Function,
      default: () => true,
    },
    beforeDeleteLink: {
      type: Function,
      default: () => true,
    },
    portDisabled: {
      type: Function,
      default: () => false,
    },
    portAvailable: {
      type: Function,
      default: () => true,
    },
    pan: {
      type: Boolean,
      default: true,
    },
    preventMouseEventsDefault: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      width: null,
    };
  },

  mounted() {
    window.addEventListener("resize", this.updateWrapperWidth);
    this.updateWrapperWidth();
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.updateWrapperWidth);
  },

  methods: {
    updateWrapperWidth: throttle(function () {
      const { width } = this.$el.getBoundingClientRect();
      this.width = width;
    }, 100),

    setModel(model) {
      this.$refs.flowx.setModel(model);
    },

    serialize() {
      return this.$refs.flowx.serialize();
    },

    addNode(node) {
      this.$refs.flowx.addNode(node);
    },

    addLink(link) {
      this.$refs.flowx.addLink(link);
    },

    updateNode({ id, name, value }) {
      this.$refs.flowx.updateNode({ id, name, value });
    },

    deleteNode(id) {
      this.$refs.flowx.deleteNode(id);
    },

    deleteLink(id) {
      this.$refs.flowx.deleteLink(id);
    },

    enableDblClickZoom() {
      return this.$refs.flowx.enableDblClickZoom();
    },
    disableDblClickZoom() {
      return this.$refs.flowx.disableDblClickZoom();
    },
    isDblClickZoomEnabled() {
      return this.$refs.flowx.isDblClickZoomEnabled();
    },
    enableMouseWheelZoom() {
      return this.$refs.flowx.enableMouseWheelZoom();
    },
    disableMouseWheelZoom() {
      return this.$refs.flowx.disableMouseWheelZoom();
    },
    isMouseWheelZoomEnabled() {
      return this.$refs.flowx.isMouseWheelZoomEnabled();
    },
    resetZoom() {
      return this.$refs.flowx.resetZoom();
    },
    updateBBox() {
      return this.$refs.flowx.updateBBox();
    },
    fit() {
      return this.$refs.flowx.fit();
    },
    contain() {
      return this.$refs.flowx.contain();
    },
    center() {
      return this.$refs.flowx.center();
    },
    zoomIn() {
      return this.$refs.flowx.zoomIn();
    },
    zoomOut() {
      return this.$refs.flowx.zoomOut();
    },
  },
};
</script>
