<script setup lang="ts">
  import draggable from 'vuedraggable'
  import { ref, nextTick, onMounted, watch, reactive } from 'vue';
  import Localbase from 'localbase';
  import TaskModal from './Modals/updateCardModal.vue';
  import type { Task, Column } from './datatypes/kanbantypes.ts';


const inputRefs = ref<Record<string, HTMLInputElement | null>>({});
const editableTitles = ref<Record<string, string>>({});
const newCardInputs = ref<Record<string, string>>({});
const newCardDeadLine = ref<Record<string, string>>({});
const newCardCategory = ref<Record<string, string>>({});
let db = new Localbase('db');

const cancelBtnRef = ref<HTMLButtonElement | null>(null);

const toastRef = ref(null);
const toastMessage = ref('Success!');
let toastInstance: { show: () => void; } | null = null;
declare const bootstrap: any;

// Three columns, each with multiple cards
const columns = reactive<Column[]>([
  {
    id: '1',
    name: 'New to do title 1',
    editStatus: false,
    addStatus: false,
    tasks: [],
  },
  {
    id: '2',
    name: 'New to do title 2',
    editStatus: false,
    addStatus: false,
    tasks: [],
  },
  {
    id: '3',
    name: 'New to do title 3',
    editStatus: false,
    addStatus: false,
    tasks: [],
  },
]);


const selectedTaskForEdit = ref<Task>({
                              id: '',
                              title: '',
                              deadline: '',
                              category: '',
                              columnId: '',
                              status: false,
                              order: 0
                            });


const categoryColors: Record<string, string> = {
  "Bug": "rgb(220, 53, 69)",              // red
  "Feature": "rgb(0, 123, 255)",          // blue
  "Improvement": "rgb(40, 167, 69)",      // green
  "Design": "rgb(255, 193, 7)",           // yellow
  "Testing": "rgb(23, 162, 184)",         // teal
  "Documentation": "rgb(108, 117, 125)",  // gray
  "Research": "rgb(102, 16, 242)",        // purple
  "Deployment": "rgb(255, 87, 34)",       // deep orange
  "Code Review": "rgb(0, 123, 255)",      // blue
  "Meeting": "rgb(32, 201, 151)",         // mint green
  "High Priority": "rgb(255, 0, 0)",      // bright red
  "Low Priority": "rgb(204, 204, 204)",   // light gray
  "Critical Fix": "rgb(176, 0, 32)",      // dark red
  "UI Update": "rgb(255, 193, 7)",        // yellow
  "Backend Task": "rgb(52, 58, 64)",      // dark gray
  "Frontend Task": "rgb(255, 159, 64)",   // orange
  "Refactoring": "rgb(111, 66, 193)",     // violet
  "DevOps": "rgb(0, 172, 193)",           // cyan
  "Security": "rgb(255, 0, 128)",         // pink/red
  "Hotfix": "rgb(255, 77, 77)",           // coral
  "Testing - Manual": "rgb(100, 149, 237)", // cornflower blue
  "Testing - Automation": "rgb(0, 100, 0)", // dark green
  "Mobile Support": "rgb(255, 140, 0)",   // dark orange
  "Performance": "rgb(0, 128, 128)",      // teal
  "SEO": "rgb(255, 215, 0)",              // gold
  "Accessibility": "rgb(70, 130, 180)",   // steel blue
  "Customer Feedback": "rgb(60, 179, 113)", // medium sea green
  "Analytics": "rgb(123, 104, 238)",      // medium slate blue
  "Data Migration": "rgb(255, 99, 132)",  // salmon pink
  "Integration": "rgb(54, 162, 235)",     // soft blue
  "API": "rgb(255, 206, 86)",             // amber
  "Database": "rgb(75, 192, 192)",        // turquoise
  "Content Update": "rgb(153, 102, 255)", // lavender purple
  "Email Campaign": "rgb(255, 159, 64)",  // orange
  "Product Planning": "rgb(0, 204, 153)", // jade green
  "Wireframing": "rgb(108, 117, 125)",    // gray
  "Prototyping": "rgb(255, 99, 71)",      // tomato
  "Release Planning": "rgb(0, 128, 128)", // teal
  "Sprint Planning": "rgb(255, 205, 86)", // light yellow
  "Retrospective": "rgb(123, 63, 0)",     // brown
  "Marketing Task": "rgb(255, 105, 180)", // hot pink
  "Customer Support": "rgb(0, 191, 255)", // deep sky blue
  "Training": "rgb(100, 149, 237)",       // cornflower blue
  "Internal Request": "rgb(169, 169, 169)", // dark gray
  "Legal": "rgb(0, 0, 128)",              // navy
  "Finance": "rgb(0, 100, 0)",            // dark green
  "Team Building": "rgb(255, 182, 193)",  // light pink
  "Onboarding": "rgb(0, 206, 209)",       // dark turquoise
  "Bug Triage": "rgb(220, 20, 60)",       // crimson
  "Changelog": "rgb(70, 130, 180)",       // steel blue
  "User Story": "rgb(72, 209, 204)",      // medium turquoise
  "Epic": "rgb(106, 90, 205)",            // slate blue
  "Task": "rgb(144, 238, 144)",           // light green
  "Spike": "rgb(138, 43, 226)",           // blue violet
};




// Called whenever a card is dropped
function onCardDrop(evt: any) {
  console.log('Card moved:', evt)
  // persist changes here if desired
}

// Called whenever columns are reordered
function onColumnReorder(evt: any) {
  console.log('Column reordered:', evt)
  // persist column order here if desired
}


const showToast = (message = 'Success!') => {
  toastMessage.value = message;
  if (toastInstance) {
    toastInstance.show();
  }
};


const enableEdit = (columnId: string, currentName: string) => {
  const column = columns.find(col => col.id === columnId);
  if (column) {
    columns.forEach(col => col.editStatus = false);
    column.editStatus = true;
    editableTitles.value[columnId] = currentName;
    nextTick(() => {
      const input = inputRefs.value[columnId];
      if (input) {
        input.focus();
        input.select();
      }
    });
  }
};


const saveEdit = (columnId: string) => {
  const column = columns.find(c => c.id === columnId);
  if (column) {
    column.name = editableTitles.value[columnId].trim() || column.name;
    db.collection('KanbanTitles').doc({ id: columnId }).set({
      id: column.id, 
      name: column.name,
      editStatus: false,
      addStatus: false
    })
    column.editStatus = false;
    showToast('Title updated successfully!');
  }
};



onMounted(() => {

  const toastEl = toastRef.value!
  toastInstance = new bootstrap.Toast(toastEl, { delay: 3000 })
  loadAllData();

});


watch(
  columns,
  async (newColumns) => {
    console.log(newColumns[1].tasks);
    let x = 1;
    for (const column of newColumns) {
      if (Array.isArray(column.tasks)) {
        let y = 1;
        for (const task of column.tasks) {
          if (task.id) {
            task.columnId = String(x);
            task.order = Number(y);
            await db.collection('KanbanCards').doc(task.id).set(JSON.parse(JSON.stringify(task)));
            console.log('Updated task:', task);
          }
          y++;
        }
      }
      x++;
    }
  },
  { deep: true }
);






const loadAllData = () => {

  db.collection('KanbanTitles').get().then((items: Column[]) => {
    if (!items || items.length === 0) {
      const defaultColumns = [
        { id: '1', name: 'Task Title 1', editStatus: false, addStatus: false },
        { id: '2', name: 'Task Title 2', editStatus: false, addStatus: false },
        { id: '3', name: 'Task Title 3', editStatus: false, addStatus: false }
      ];
      defaultColumns.forEach(col => {
        db.collection('KanbanTitles').doc(col.id).set(col);
      });
    } else {
      // Only update column.name
      items.forEach(item => {
        const existing = columns.find(col => col.id === item.id);
        if (existing) {
          existing.name = item.name;
        }
      });
    }
  });


  db.collection('KanbanCards').orderBy('order').get().then((items: Task[]) => {
    if (items && items.length !== 0) {

      columns.forEach(col => {
        col.tasks = [];
      });

      items.forEach(item => {
        // Format deadline from "YYYY-MM-DD" to "Month DD, YYYY"
        if (item.deadline) {
          const dateObj = new Date(item.deadline);
          item.deadline = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: '2-digit'
          });
        }

        if (item.columnId == '1') {
          columns[0].tasks.push(item);
        } else if (item.columnId == '2') {
          columns[1].tasks.push(item);
        } else {
          columns[2].tasks.push(item);
        }
      });

    }
  });

};




const loadSelectedTask = (selectedData: Task, columnId: string) => {

    const parsedDate = new Date(selectedData.deadline);
    const formattedDate = parsedDate.toISOString().split('T')[0].replace(/-/g, '-');

    selectedTaskForEdit.value = {
      ...selectedData,
      deadline: formattedDate,
      columnId: columnId
    };

};




const handleAddCard = (columnId: string) => {
  const column = columns.find(c => c.id === columnId);
  
  if (column) { 
    const card_name = newCardInputs.value[columnId]?.trim() || "";
    const deadline = newCardDeadLine.value[columnId]?.trim() || "";
    const category = newCardCategory.value[columnId]?.trim() || "";

    const formattedDate = new Date(deadline).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric"
                              });
    
    if(card_name != "" && deadline != "" && category != ""){
      const uuid = crypto.randomUUID();
      db.collection('KanbanCards').doc(uuid).set({
        id: uuid, 
        title: card_name,
        deadline: formattedDate,
        category: category,
        columnId: columnId,
        status: false,
      });
      column.tasks.push({
        id: uuid, 
        title: card_name,
        deadline: formattedDate,
        category: category,
        columnId: columnId,
        status: false,
        order: column.tasks.length,
      });
      column.addStatus = false;
      newCardCategory.value[columnId] = "";
      newCardDeadLine.value[columnId] = "";
      newCardInputs.value[columnId] = "";

      showToast('Task added successfully!');

    } else {
      column.addStatus = false;
      newCardCategory.value[columnId] = "";
      newCardDeadLine.value[columnId] = "";
      newCardInputs.value[columnId] = "";
    }

  }
};




const updateTaskStatus = (task: Task) => {

  if(!task.status){
      if(confirm('Mark as incomplete?')){
        db.collection('KanbanCards')
        .doc(task.id)
        .update({ status: task.status })
        .then(() => {
          console.log(`Task ${task.id} status updated.`);
        })
        .catch((err: any) => {
          console.error('Failed to update status:', err);
        });
      }
  } else {
    if(confirm('Mark as complete?')){
      db.collection('KanbanCards')
      .doc(task.id)
      .update({ status: task.status })
      .then(() => {
        console.log(`Task ${task.id} status updated.`);
      })
      .catch((err: any) => {
        console.error('Failed to update status:', err);
      });
    }
  }

  showToast('Task updated successfully!');

};



const deleteTask = (taskId: string, taskColumnId: string) => {

  const rowIndex = columns[Number(taskColumnId)-1].tasks.findIndex(col => col.id === taskId);

  if(confirm('Confirm Delete?')){
    if(rowIndex != -1){
      db.collection('KanbanCards').doc({ id: columns[Number(taskColumnId)-1].tasks[rowIndex].id }).delete();
      columns[Number(taskColumnId)-1].tasks.splice(rowIndex, 1);
      showToast('Task deleted successfully!');
    }
  }

};




const updateTask = () => {

  const rowIndex = columns[Number(selectedTaskForEdit.value.columnId)-1].tasks.findIndex((item) => item.id === selectedTaskForEdit.value.id);

  if(rowIndex != -1){

    const dateObj = new Date(selectedTaskForEdit.value.deadline);
    selectedTaskForEdit.value.deadline = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    });

    columns[Number(selectedTaskForEdit.value.columnId)-1].tasks[rowIndex] = {...selectedTaskForEdit.value,};
    db.collection('KanbanCards').doc({ id: selectedTaskForEdit.value.id }).update(selectedTaskForEdit.value);

    // clear fields
    selectedTaskForEdit.value = {
                                  id: '',
                                  title: '',
                                  deadline: '',
                                  category: '',
                                  columnId: '',
                                  status: false,
                                  order: 0
                                };
    closeModal();
    showToast('Task updated successfully!');

  }

  
  
};


const closeModal = () => {
  if (cancelBtnRef.value) {
    cancelBtnRef.value.click();
  }
}



const showAddCardForm = (columnId: string) => {
  const column = columns.find(col => col.id === columnId);
  if (column) {
    columns.forEach(col => col.addStatus = false);
    column.addStatus = !column.addStatus;
    newCardInputs.value[columnId] = "";
    nextTick(() => {
      const input = inputRefs.value[columnId];
      if (input) {
        input.focus();
        input.select();
      }
    });
  }
};







</script>
















<template>

  <div class="container mt-5" id="kanban-board">
        <h2 class="text-center mb-4">Swimlane Task Board</h2>

  <div class="row">

        <!-- Draggable Columns Container -->
        <draggable
          v-model="columns"
          group="columns"
          item-key="id"
          :disabled=true
          animation="200"
          class="row m-0"
          @end="onColumnReorder"
        >
          <template #item="{ element: column, index: ci }">

            <div class="card col-lg-4 col-sm-12 col-md-12 p-2" style="background-color: transparent;border:none;">

              <div class="card-header d-flex" @click="enableEdit(column.id, column.name)" style="border: solid black 1px;background-color: black;color:white;">
                
                <b v-if="!column.editStatus">{{ column.name }}</b>

                <input
                  v-else
                  v-model="editableTitles[column.id]"
                  @blur="saveEdit(column.id)"
                  @keyup.enter="saveEdit(column.id)"
                  type="text"
                  class="form-control"
                  :ref="(el) => {inputRefs[column.id] = el as HTMLInputElement}"
                />


                <div class="ms-auto">
                  <button
                    aria-label="Lane options"
                    class="btn btn-light btn-sm"
                  >
                  ⋮
                </button>
                </div>
              </div>


              <div class="card-body p-0">

                <!-- Draggable Cards inside this Column -->
                <draggable
                  v-model="column.tasks"
                  :group="{ name: 'cards', pull: true, put: true }"
                  item-key="id"
                  animation="200"
                  @end="onCardDrop"
                  class="card-style"
                >
                  <template #item="{ element: task }">
                    <div class="card mb-2" style="background-color: white !important;box-shadow: rgb(173 166 166) 1px 3px 0px;">

                      <div class="card-body d-flex align-items-start pt-0 pb-0">
                        <!-- Checkbox -->
                        <div class="me-3 pt-4">
                          <input class="form-check-input" v-model="task.status" @change="updateTaskStatus(task)" type="checkbox" style="border:solid green;width: 20px;height: 20px;" :id="task.id" />
                        </div>

                        <!-- Task content -->
                        <div class="flex-grow-1" 
                            aria-label="Lane options"
                            data-bs-toggle="modal"
                            data-bs-target="#editModal"
                            @click="loadSelectedTask(task, column.id)">
                          <!-- Category badge -->
                          <div class="mb-0">
                            <span class="badge"
                                  :style="`background-color: ${categoryColors[task.category]}`"
                            >{{ task.category }}</span>
                          </div>

                          <!-- Title -->
                          <div class="fw-bold mb-1" :class="{ 'text-decoration-line-through': task.status }">{{ task.title }}</div>

                          <!-- Date with clock icon -->
                          <div class="text-muted small d-flex align-items-center">
                            <i class="fa-regular fa-clock me-1"></i>
                            {{ task.deadline || 'No due date' }}
                          </div>
                        </div>

                        <!-- Edit/Delete Buttons -->
                        <div class="ms-auto d-flex flex-column justify-content-center align-items-center pe-2 pt-2">              
                          <!-- Delete button -->
                          <button @click.stop="deleteTask(task.id, column.id)" class="btn btn-lg btn-link p-0 pt-2 text-danger" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>

                    </div>
                  </template>
                </draggable>

                


                <div v-if="!column.addStatus" class="card-footer" @click="showAddCardForm(column.id)">
                  <b >+ Add another card</b>
                </div>


                <div v-else class="card-footer" style="padding: 5px;">
                
                  <form @submit.prevent="handleAddCard(column.id)" style="background-color: rgb(230,230,230);padding:5px;">

                      <div class="form-floating">
                        <select :ref="el => inputRefs[column.id] = el as HTMLInputElement" v-model="newCardCategory[column.id]" class="form-control" style="margin-bottom:10px;" placeholder="Set Deadline" id="categoryLabel">
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
                        <input type="date" :ref="el => inputRefs[column.id] = el as HTMLInputElement" v-model="newCardDeadLine[column.id]" style="margin-bottom:10px;" class="form-control" placeholder="Set Deadline" id="deadlineLabel"></input>
                        <label for="deadlineLabel">Set Deadline</label>
                      </div>

                      <div class="form-floating">
                        <input :ref="el => inputRefs[column.id] = el as HTMLInputElement" v-model="newCardInputs[column.id]" style="height: 80px;margin-bottom:10px;" class="form-control" placeholder="Enter a title or paste a link" id="titleLabel"></input>
                        <label for="titleLabel">Enter a title or paste a link</label>
                      </div>

                      <button class="btn btn-primary">Add card</button>
                      <a class="btn btn-default" @click="handleAddCard(column.id)"><i class="fa-solid fa-x"></i></a>

                  </form>
              
                </div>

              </div>
              

            </div>
          </template>
        </draggable>


  </div>
  </div>




      <TaskModal
        :selectedTaskForEdit="selectedTaskForEdit"
        @update-task="updateTask"
      />


      <!-- Toast Container -->
      <div class="position-fixed top-0 end-0 p-3" style="z-index: 1100">
          <div
            class="toast align-items-center text-white bg-success border-0"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          ref="toastRef"
        >
          <div class="d-flex">
            <div class="toast-body">
              {{ toastMessage }}
            </div>
            <button
              type="button"
              class="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
              aria-label="Close"
            ></button>
          </div>
        </div>
      </div>
  


</template>








<style>

#kanban-board{
  background-color: rgb(255, 255, 255);
  color: black;
  height: 90vh;
}

body {
  background: linear-gradient(135deg, #507fde, #f73333);
}

.card {
  border-radius: 0.5rem;
  background-color: red;
}


.card-style{
  border:solid gray 1px;
  padding:10px;
  max-height: 400px;
  overflow-x: auto;
  background-color: rgb(185, 235, 235);
}

.card-footer {
  border-top-color: transparent;
  background-color: #f8f9fa;
  cursor: pointer;
  border: solid black 1px;
  border-top: none;
  border-radius: 0px 0px 10px 10px;
}

/* Container */
.container {
  padding: 20px;
  border-radius: 1%;
}


/* Modal Styling */
.modal-content {
  border-radius: 8px;
}

.modal-header {
  background-color: #f4f5f7;
  border-bottom: 1px solid #dcdfe4;
}

</style>
