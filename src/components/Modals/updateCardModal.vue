<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

// Props
const props = defineProps<{
  selectedTaskForEdit: {
    id: number
    title: string
    category: string
    deadline: string
  }
}>()

// Emits
const emit = defineEmits<{
  (e: 'update-task', updatedTask: typeof props.selectedTaskForEdit): void
}>()

// Refs
const cancelBtnRef = ref<HTMLButtonElement | null>(null)

// Methods
function updateTask() {
  // Emit the updated task object to parent
  emit('update-task', props.selectedTaskForEdit)

  // Close modal programmatically
  cancelBtnRef.value?.click()
}
</script>

<template>
  <!-- Modal -->
  <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title" id="editModalLabel">Edit Task Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" ref="cancelBtnRef"></button>
        </div>

        <form @submit.prevent="updateTask" style="padding: 5px">
          <div class="modal-body">
            <div class="form-floating">
              <select
                class="form-control"
                v-model="props.selectedTaskForEdit.category"
                style="margin-bottom: 10px"
                id="categoryLabel"
                required
              >
                <option value="">-- Select Category --</option>
                <option>Bug</option>
                <option>Feature</option>
                <option>Improvement</option>
                <option>Design</option>
                <option>Testing</option>
                <option>Documentation</option>
                <option>Research</option>
                <option>Deployment</option>
                <option>Code Review</option>
                <option>Meeting</option>
                <option>High Priority</option>
                <option>Low Priority</option>
                <option>Critical Fix</option>
                <option>UI Update</option>
                <option>Backend Task</option>
                <option>Frontend Task</option>
                <option>Refactoring</option>
                <option>DevOps</option>
                <option>Security</option>
                <option>Hotfix</option>
                <option>Testing - Manual</option>
                <option>Testing - Automation</option>
                <option>Mobile Support</option>
                <option>Performance</option>
                <option>SEO</option>
                <option>Accessibility</option>
                <option>Customer Feedback</option>
                <option>Analytics</option>
                <option>Data Migration</option>
                <option>Integration</option>
                <option>API</option>
                <option>Database</option>
                <option>Content Update</option>
                <option>Email Campaign</option>
                <option>Product Planning</option>
                <option>Wireframing</option>
                <option>Prototyping</option>
                <option>Release Planning</option>
                <option>Sprint Planning</option>
                <option>Retrospective</option>
                <option>Marketing Task</option>
                <option>Customer Support</option>
                <option>Training</option>
                <option>Internal Request</option>
                <option>Legal</option>
                <option>Finance</option>
                <option>Team Building</option>
                <option>Onboarding</option>
                <option>Bug Triage</option>
                <option>Changelog</option>
                <option>User Story</option>
                <option>Epic</option>
                <option>Task</option>
                <option>Spike</option>
              </select>
              <label for="categoryLabel">Select Category</label>
            </div>

            <div class="form-floating">
              <input
                type="date"
                v-model="props.selectedTaskForEdit.deadline"
                class="form-control"
                style="margin-bottom: 10px"
                id="deadlineLabel"
                required
              />
              <label for="deadlineLabel">Set Deadline</label>
            </div>

            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                style="height: 80px; margin-bottom: 10px"
                v-model="props.selectedTaskForEdit.title"
                id="titleLabel"
                required
              />
              <label for="titleLabel">Enter a title or paste a link</label>
            </div>
          </div>

          <div class="modal-footer">
            <a type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</a>
            <button type="submit" class="btn btn-primary">Update Task</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add custom styles if needed */
</style>
