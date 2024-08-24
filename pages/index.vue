<template>
  <div>
    <b-button variant="primary" class="mb-3" @click="showCreateAccordionModal">
      Create New Accordion
    </b-button>
    <AccordionItem
      v-for="accordion in accordions"
      :key="accordion.id"
      :accordion="accordion"
      @fetchContent="fetchAccordionContent"
      @editAccordion="updateAccordion"
      @deleteAccordion="deleteAccordion"
      @createChildAccordion="showCreateAccordionModal"
    />
    <!-- Modal for creating accordion -->
    <b-modal v-model="showModal" title="Create New Accordion">
      <b-form @submit.prevent="createAccordion">
        <b-form-group label="Title" label-for="title-input">
          <b-form-input
            id="title-input"
            v-model="form.title"
            required
          />
        </b-form-group>
        <b-form-group label="Content" label-for="content-input">
          <b-form-textarea
            id="content-input"
            v-model="form.content"
          />
        </b-form-group>
        <b-form-group label="Parent Accordion (optional)" label-for="parent-id-select">
          <b-form-select
            id="parent-id-select"
            v-model="form.parentId"
            :options="parentOptions"
            placeholder="Select a parent accordion (optional)"
          />
        </b-form-group>
        <b-button type="submit" variant="primary">
          Create
        </b-button>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { BModal, BForm, BFormGroup, BFormInput, BFormTextarea, BButton, BFormSelect } from 'bootstrap-vue'
import AccordionItem from '~/components/AccordionItem.vue'

export default {
  components: { AccordionItem, BModal, BForm, BFormGroup, BFormInput, BFormTextarea, BButton, BFormSelect },
  async asyncData ({ store }) {
    await store.dispatch('fetchAccordions')
  },
  data () {
    return {
      showModal: false,
      form: {
        title: '',
        content: '',
        parentId: null
      },
      parentOptions: []
    }
  },
  computed: {
    accordions () {
      return this.$store.state.accordions
    }
  },
  methods: {
    async fetchParentAccordions () {
      try {
        const response = await this.$axios.get('/all')
        this.parentOptions = response.data.map(acc => ({
          value: acc.id,
          text: acc.title
        }))
      } catch (error) {
        console.error('Error fetching parent accordions:', error)
      }
    },
    fetchAccordionContent (id) {
      this.$store.dispatch('fetchAccordionContent', id)
    },
    showCreateAccordionModal (parentId = null) {
      this.form.parentId = parentId
      this.form.title = ''
      this.form.content = ''
      this.showModal = true
      this.fetchParentAccordions()
    },
    async createAccordion () {
      const { title, content, parentId } = this.form
      if (!title.trim()) {
        alert('Title is required!')
        return
      }

      const validParentId = parentId ? parseInt(parentId, 10) : null

      try {
        await this.$store.dispatch('createAccordion', { title, content, parent_id: validParentId })
        this.showModal = false
      } catch (error) {
        console.error('Error:', error.response.data)
        alert('Error creating accordion!')
      }
    },
    async updateAccordion (id, accordionData) {
      await this.$store.dispatch('updateAccordion', { id, accordionData })
    },
    async deleteAccordion (id) {
      await this.$store.dispatch('deleteAccordion', id)
    }
  }
}
</script>
