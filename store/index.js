export const state = () => ({
  accordions: [],
  loading: false
})

export const mutations = {
  setAccordions (state, accordions) {
    state.accordions = accordions
  },
  addAccordion (state, accordion) {
    if (accordion.parent_id === null) {
      state.accordions.push(accordion)
    } else {
      // Add child to parent directly
      const parent = findAccordionById(state.accordions, accordion.parent_id)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(accordion)
      }
    }
  },
  updateAccordion (state, updatedAccordion) {
    const accordion = findAccordionById(state.accordions, updatedAccordion.id)
    if (accordion) {
      Object.assign(accordion, updatedAccordion)
    }
  },
  deleteAccordion (state, id) {
    // Remove the accordion itself
    state.accordions = state.accordions.filter(acc => acc.id !== id)

    // Also remove from parents' children lists
    state.accordions.forEach((acc) => {
      if (acc.children) {
        acc.children = acc.children.filter(child => child.id !== id)
      }
    })
  },
  removeAccordionChildren (state, { parentId, childId }) {
    const parent = findAccordionById(state.accordions, parentId)
    if (parent && parent.children) {
      parent.children = parent.children.filter(child => child.id !== childId)
    }
  },
  setAccordionChildrenLoaded (state, { id, childrenLoaded }) {
    const accordion = findAccordionById(state.accordions, id)
    if (accordion) {
      accordion.childrenLoaded = childrenLoaded
    }
  }
}

export const actions = {
  async fetchAccordions ({ commit }) {
    try {
      const response = await this.$axios.$get('/accordions')
      commit('setAccordions', response)
    } catch (error) {
      console.error('Error fetching accordions:', error)
    }
  },

  async fetchAccordionChildren ({ commit }, id) {
    try {
      const response = await this.$axios.$get(`/accordions/${id}/children`)
      commit('setAccordionChildren', { parentId: id, children: response })
    } catch (error) {
      console.error('Error fetching accordion children:', error)
    }
  },

  async createAccordion ({ commit }, accordionData) {
    try {
      const response = await this.$axios.$post('/accordions', accordionData)
      commit('addAccordion', response)
    } catch (error) {
      console.error('Error creating accordion:', error)
    }
  },

  async updateAccordion ({ commit }, { id, accordionData }) {
    try {
      const response = await this.$axios.$put(`/accordions/${id}`, accordionData)
      commit('updateAccordion', response)
    } catch (error) {
      console.error('Error updating accordion:', error)
    }
  },

  async deleteAccordion ({ commit }, id) {
    try {
      await this.$axios.$delete(`/accordions/${id}`)
      commit('deleteAccordion', id)
    } catch (error) {
      console.error('Error deleting accordion:', error)
    }
  },

  async deleteChildAccordion ({ commit }, { parentId, childId }) {
    try {
      await this.$axios.$delete(`/accordions/${childId}`)
      commit('removeAccordionChildren', { parentId, childId })
    } catch (error) {
      console.error('Error deleting child accordion:', error)
    }
  }
}

function findAccordionById (accordions, id) {
  for (const acc of accordions) {
    if (acc.id === id) {
      return acc
    }
    if (acc.children) {
      const found = findAccordionById(acc.children, id)
      if (found) {
        return found
      }
    }
  }
  return null
}
