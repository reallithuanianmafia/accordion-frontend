<template>
  <b-card v-if="accordion" class="mb-3">
    <b-card-header>
      <b-button
        class="w-100 text-left"
        variant="link"
        @click="toggleCollapse"
      >
        {{ accordion.title }}
      </b-button>
      <b-button variant="danger" @click="confirmDelete">
        Delete
      </b-button>
      <b-button variant="warning" @click="showUpdateAccordionModal">
        Edit
      </b-button>
    </b-card-header>
    <b-collapse v-model="isCollapsed" class="card-body">
      <b-card-body>
        <p>{{ accordion.content }}</p>
        <b-button v-if="!isLoading" variant="secondary" @click="loadChildren">
          Load Children
        </b-button>
        <b-button v-if="isLoading" variant="secondary" disabled>
          Loading...
        </b-button>
        <AccordionItem
          v-for="child in accordion.children"
          :key="child.id"
          :accordion="child"
          @fetchContent="fetchAccordionContent"
          @editAccordion="updateAccordion"
          @deleteAccordion="deleteChildAccordion"
          @createChildAccordion="createAccordion"
        />
      </b-card-body>
    </b-collapse>

    <!-- Modal for updating accordion -->
    <b-modal v-model="showUpdateModal" title="Update Accordion">
      <b-form @submit.prevent="updateAccordion">
        <b-form-group label="Title" label-for="update-title-input">
          <b-form-input
            id="update-title-input"
            v-model="updateForm.title"
            required
          />
        </b-form-group>
        <b-form-group label="Content" label-for="update-content-input">
          <b-form-textarea
            id="update-content-input"
            v-model="updateForm.content"
          />
        </b-form-group>
        <b-button type="submit" variant="primary">
          Update
        </b-button>
      </b-form>
    </b-modal>
  </b-card>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'AccordionItem',
  props: {
    accordion: Object
  },
  data () {
    return {
      isCollapsed: false,
      isLoading: false,
      showUpdateModal: false,
      updateForm: {
        title: '',
        content: ''
      }
    }
  },
  methods: {
    ...mapActions(['fetchAccordionChildren', 'updateAccordion', 'deleteAccordion', 'deleteChildAccordion', 'setAccordionChildrenLoaded']),

    toggleCollapse () {
      this.isCollapsed = !this.isCollapsed
      if (this.isCollapsed && !this.accordion.childrenLoaded) {
        this.loadChildren()
      }
    },

    async loadChildren () {
      if (this.isLoading) { return }
      this.isLoading = true
      try {
        await this.fetchAccordionChildren(this.accordion.id)
        this.$store.commit('setAccordionChildrenLoaded', { id: this.accordion.id, childrenLoaded: true })
      } catch (error) {
        console.error('Error loading children:', error)
      } finally {
        this.isLoading = false
      }
    },

    confirmDelete () {
      if (confirm('Are you sure you want to delete this accordion?')) {
        this.deleteAccordion()
      }
    },

    async deleteAccordion () {
      try {
        await this.$store.dispatch('deleteAccordion', this.accordion.id)
        // Optionally, you can emit an event to refresh the parent component if needed
      } catch (error) {
        console.error('Error deleting accordion:', error)
      }
    },

    async deleteChildAccordion (id) {
      if (confirm('Are you sure you want to delete this child accordion?')) {
        try {
          await this.$store.dispatch('deleteChildAccordion', { parentId: this.accordion.id, childId: id })
        } catch (error) {
          console.error('Error deleting child accordion:', error)
        }
      }
    },

    showUpdateAccordionModal () {
      this.updateForm.title = this.accordion.title
      this.updateForm.content = this.accordion.content
      this.showUpdateModal = true
    },

    async updateAccordion () {
      try {
        await this.$store.dispatch('updateAccordion', {
          id: this.accordion.id,
          accordionData: this.updateForm
        })
        this.showUpdateModal = false
      } catch (error) {
        console.error('Error updating accordion:', error)
      }
    }
  }
}
</script>
