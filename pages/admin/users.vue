<!-- /pages/admin/users.vue -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white mb-2">User Management</h1>
        <p class="text-gray-400">
          Manage user accounts, roles, and permissions across your organization.
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="openBulkUplaod"
          class="bg-dark-800 hover:bg-dark-700 text-white px-4 py-2 rounded-lg border border-dark-700 transition-colors flex items-center space-x-2"
        >
          <UIcon name="i-heroicons-cloud-arrow-up" class="w-4 h-4" />
          <span>Bulk Upload</span>
        </button>
        <button
          @click="openAddUserModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <UIcon name="i-heroicons-plus" class="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Users -->
      <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Total Users</p>
            <p class="text-3xl font-bold text-white mt-2">{{ stats.totalUsers }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-users" class="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      <!-- Active Users -->
      <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Active Users</p>
            <p class="text-3xl font-bold text-white mt-2">{{ stats.activeUsers }}</p>
          </div>
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>

      <!-- Admins -->
      <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">Admins</p>
            <p class="text-3xl font-bold text-white mt-2">{{ stats.adminUsers }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-shield-check" class="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      <!-- New This Month -->
      <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-400 text-sm font-medium">New This Month</p>
            <p class="text-3xl font-bold text-white mt-2">{{ stats.newThisMonth }}</p>
          </div>
          <div class="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-heroicons-user-plus" class="w-6 h-6 text-orange-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-dark-800 rounded-lg p-6 border border-dark-700">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search Input -->
        <div class="flex-1">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UIcon name="i-heroicons-magnifying-glass" class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users..."
              class="block w-full pl-10 pr-3 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <!-- Role Filter -->
        <div class="sm:w-48">
          <select
            v-model="selectedRole"
            class="block w-full px-3 py-3 border border-dark-700 rounded-lg bg-dark-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="sm:w-48">
          <select
            v-model="selectedStatus"
            class="block w-full px-3 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
      <!-- Table Header -->
      <div class="px-6 py-4 border-b border-dark-700">
        <h2 class="text-lg font-semibold text-white">All Users</h2>
        <p class="text-gray-400 text-sm">
          A list of all users in your organization including their contact information and roles.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p class="text-gray-400 mt-2">Loading users...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-8 text-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-400 mx-auto" />
        <p class="text-red-400 mt-2">Failed to load users</p>
        <button
          @click="loadUsers"
          class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>

      <!-- Table Content -->
      <div v-else>
        <UTable
          :columns="columns"
          :rows="paginatedUsers"
          :sort="sort"
          @sort="(s) => (sort = s)"
          class="text-white"
        >
          <!-- Custom cells -->
          <template #name-data="{ row }">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span class="text-blue-400 font-medium text-sm">{{ row.initials }}</span>
              </div>
              <div class="ml-3">
                <div class="text-sm font-medium text-white">{{ row.name }}</div>
                <div class="text-sm text-gray-400">{{ row.username }}</div>
              </div>
            </div>
          </template>

          <template #contact-data="{ row }">
            <div class="text-sm text-white">{{ row.email }}</div>
            <div class="text-sm text-gray-400">{{ row.phone }}</div>
          </template>

          <template #role-data="{ row }">
            <span
              class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
              :class="{
                'bg-purple-500/20 text-purple-400': row.role === 'admin',
                'bg-blue-500/20 text-blue-400': row.role === 'manager',
                'bg-gray-500/20 text-gray-400': row.role === 'user',
              }"
            >
              {{ row.role }}
            </span>
          </template>

          <template #status-data="{ row }">
            <span
              class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
              :class="{
                'bg-green-500/20 text-green-400': row.status === 'active',
                'bg-red-500/20 text-red-400': row.status === 'inactive',
              }"
            >
              <div
                class="w-1.5 h-1.5 rounded-full mr-1"
                :class="{
                  'bg-green-400': row.status === 'active',
                  'bg-red-400': row.status === 'inactive',
                }"
              ></div>
              {{ row.status }}
            </span>
          </template>

          <template #tokensUsed-data="{ row }">
            {{ row.tokensUsed.toLocaleString() }}
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center space-x-2">
              <button
                @click="editUser(row)"
                class="text-blue-400 hover:text-blue-300 transition-colors"
                title="Edit user"
              >
                <UIcon name="i-heroicons-pencil" class="w-4 h-4" />
              </button>
              <button
                @click="deleteUser(row)"
                class="text-red-400 hover:text-red-300 transition-colors"
                title="Delete user"
              >
                <UIcon name="i-heroicons-trash" class="w-4 h-4" />
              </button>
            </div>
          </template>
        </UTable>
        <div class="p-4 flex justify-end border-t border-dark-700">
          <UPagination
            v-model="page"
            :total="sortedRows.length"
            :page-count="pageSize"
            :show-first="true"
            :show-last="true"
            :show-edges="true"
            size="sm"
            color="blue"
          />
        </div>
      </div>
    </div>

    <!-- User Modal (Add/Edit) -->
    <UModal v-model="showUserModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">
              {{ isEditMode ? 'Edit User' : 'Add New User' }}
            </h3>
            <button @click="closeUserModal" class="text-gray-400 hover:text-white">
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>
        </template>

        <UForm :state="userForm" :schema="userSchema" @submit="saveUser" class="space-y-4">
          <!-- Name -->
          <UFormGroup label="Name" name="name" required>
            <UInput
              v-model="userForm.name"
              type="text"
              placeholder="Enter full name"
              :ui="{
                base: 'w-full px-3 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
                padding: { sm: 'p-3' },
              }"
            />
          </UFormGroup>

          <!-- Email -->
          <UFormGroup label="Email" name="email" required>
            <UInput
              v-model="userForm.email"
              type="email"
              placeholder="Enter email address"
              :ui="{
                base: 'w-full px-3 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
                padding: { sm: 'p-3' },
              }"
            />
          </UFormGroup>

          <!-- Phone -->
          <UFormGroup name="phone" label="Phone Number">
            <LibVueTelInput
              ref="phoneRef"
              :prop-phone="userForm.phone"
              placeholder="Your phone number"
              defaultCountry="us"
            />
          </UFormGroup>

          <!-- Role -->
          <UFormGroup label="Role" name="role" required>
            <USelect
              v-model="userForm.role"
              :options="roleOptions"
              option-attribute="label"
              value-attribute="value"
              placeholder="Select Role"
              :ui="{
                base: 'w-full px-3 py-3 border border-dark-700 rounded-lg bg-dark-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500',
                padding: { sm: 'p-3' },
              }"
            />
          </UFormGroup>

          <!-- Primary Contact -->
          <UFormGroup name="primaryContact">
            <UCheckbox
              v-model="userForm.primaryContact"
              label="Make Primary Contact"
              :ui="{ base: 'rounded bg-dark-900 border-dark-700' }"
            />
          </UFormGroup>

          <!-- Active Status -->
          <!-- <UFormGroup name="isActive">
            <UCheckbox
              v-model="userForm.isActive"
              label="Active User"
              :ui="{ base: 'rounded bg-dark-900 border-dark-700' }"
            />
          </UFormGroup> -->

          <!-- Buttons -->
          <div class="flex space-x-3 pt-4">
            <UButton
              type="button"
              @click="closeUserModal"
              label="Cancel"
              color="gray"
              class="flex-1 px-3 py-3 justify-center"
            />
            <UButton
              type="submit"
              :loading="isEditMode ? updatingUser : addingUser"
              :label="
                isEditMode
                  ? updatingUser
                    ? 'Saving...'
                    : 'Save Changes'
                  : addingUser
                    ? 'Adding...'
                    : 'Add User'
              "
              class="flex-1 px-3 py-3 justify-center"
            />
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- Delete User Modal -->
    <UModal v-model="showDeleteUserModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-white">Delete User</h3>
        </template>

        <p class="text-gray-300 mb-6">
          Are you sure you want to delete
          <span class="font-semibold">{{ selectedUser?.name }}</span
          >?<br />
          They will no longer have access but their data will remain in the system.
        </p>

        <div class="flex space-x-3">
          <UButton
            @click="showDeleteUserModal = false"
            label="Cancel"
            color="gray"
            class="flex-1 px-3 py-3 justify-center"
          />
          <UButton
            @click="confirmDelete"
            :loading="deletingUser"
            label="Delete"
            color="red"
            class="flex-1 px-3 py-3 justify-center"
          />
        </div>
      </UCard>
    </UModal>

    <!-- Bulk Upload Modal -->

    <UModal
      v-model="showForm2"
      prevent-close
      class="custom-modal"
      :ui="{
        width: 'sm:max-w-3xl xl:max-w-4xl',
        base: 'max-h-[90vh] overflow-y-auto',
      }"
    >
      <UCard
        :ui="{
          base: 'h-full flex flex-col',
          rounded: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
          body: { base: 'grow' },
        }"
      >
        <!-- Modal Header -->
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Upload Bulk Users
            </h3>
            <div class="flex items-center space-x-2">
              <UButton
                @click="downloadCsv"
                icon="i-heroicons:cloud-arrow-down-16-solid"
                class="download-csv-template-btn text-white bg-custom1-400 hover:bg-custom1-500 focus:outline-none"
              >
                Download CSV Template
              </UButton>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark-20-solid"
                class="-my-1"
                @click="closePreviewForm"
              />
            </div>
          </div>
        </template>

        <!-- Modal Body -->
        <div class="upload-area space-y-4">
          <!-- File Upload Section -->
          <div
            class="drag-area border-dashed border-2 border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer"
            @dragover.prevent
            @dragenter.prevent
            @drop="handleFileDrop"
            @click="triggerFileInput"
          >
            <p class="text-gray-500">Drag and drop a file here or Click to select a file</p>
            <p class="text-sm text-gray-400 mt-2">Supported file types: CSV files only</p>
            <p class="text-sm text-gray-400 mt-2">
              Note: The WhatsApp number should start with the country code, followed by a valid
              number without any spaces.
            </p>
            <input
              type="file"
              ref="fileInput"
              class="hidden"
              @change="handleFileInput"
              accept=".csv"
            />
          </div>

          <!-- File Preview Section -->
          <div v-if="selectedFile" class="file-preview border border-gray-300 rounded-md p-4">
            <h4 class="font-semibold mb-2">Users Preview</h4>
            <div v-html="viewContent" class="users-preview"></div>
          </div>
        </div>

        <!-- Modal Footer -->
        <template #footer>
          <div class="flex justify-end space-x-4">
            <UButton @click="closePreviewForm" class="bg-gray-300 hover:bg-gray-400 rounded">
              Cancel
            </UButton>
            <UButton
              type="button"
              :disabled="errors.length > 0 || !selectedFile"
              @click="handleUpload"
              class="bg-custom1-400 text-white hover:bg-custom1-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
// Types
interface ApiUser {
  user_id: string
  name: string
  email: string
  contact_number: string
  role_id: number
  role?: string
  status?: string
  added_by: string
  primary_contact: boolean
  org_name: string
  updated_at: string
  created_at: string
  source: string
  tokens_used?: number
  added_at?: string
}

interface MappedUser {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  initials: string
  username: string
  lastActive: string
  created: string
  tokensUsed: number
  primaryContact?: boolean
  isActive?: boolean
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  newThisMonth: number
}

interface UserForm {
  id?: string
  name: string
  email: string
  phone: string
  role: string
  primaryContact: boolean
  isActive: boolean
}

// Using admin layout
definePageMeta({
  layout: 'admin',
})

// Store
const usersStore = useUsersStore()
const profileStore = useProfileStore()

// Reactive state
const phoneRef = ref(null)
const phoneValidation = ref({ status: true, message: '' })

const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const showUserModal = ref(false)
const showDeleteUserModal = ref(false)
const loading = ref(false)
const addingUser = ref(false)
const updatingUser = ref(false)
const deletingUser = ref(false)
const error = ref<string | null>(null)

const usersList = ref<MappedUser[]>([])
const selectedUser = ref<MappedUser | null>(null)
const isEditMode = ref(false)

const userForm = reactive<UserForm>({
  id: '',
  name: '',
  email: '',
  phone: '',
  role: '',
  primaryContact: false,
  isActive: true,
})

const { showSuccess, showError } = useNotification()

// Table columns with sorting enabled
const columns = [
  { key: 'name', label: 'User', sortable: true },
  { key: 'contact', label: 'Contact', sortable: false },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'lastActive', label: 'Last Active', sortable: true },
  { key: 'created', label: 'Created', sortable: true },
  { key: 'tokensUsed', label: 'Tokens Used', sortable: true },
  { key: 'actions', label: 'Actions' },
]

const sort = ref<{ column: string; direction: 'asc' | 'desc' | null }>({
  column: 'name',
  direction: 'asc',
})

const sortedRows = computed(() => {
  if (!sort.value.column || !sort.value.direction) return rows.value

  return [...rows.value].sort((a, b) => {
    const col = sort.value.column as keyof typeof a
    const dir = sort.value.direction === 'asc' ? 1 : -1

    if (a[col] < b[col]) return -1 * dir
    if (a[col] > b[col]) return 1 * dir
    return 0
  })
})

const rows = computed(() =>
  filteredUsers.value.map((user) => ({
    ...user,
    contact: `${user.email} \n ${user.phone}`,
  })),
)

const page = ref(1)
const pageSize = ref(5) // rows per page

const paginatedUsers = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'User' },
]

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  primaryContact: z.boolean().optional(), // optional
  isActive: z.boolean().default(true),
})

// Function to validate phone and update UI
const validatePhoneField = () => {
  const phoneData = phoneRef.value?.phoneData

  if (phoneData && phoneData.valid) {
    phoneValidation.value = { status: true, message: '' }
    return true
  } else {
    phoneValidation.value = { status: false, message: 'Please enter a valid phone number' }
    return false
  }
}
// Computed properties
const stats = computed<UserStats>(() => {
  const totalUsers = usersList.value.length
  const activeUsers = usersList.value.filter((user) => user.status === 'active').length
  const adminUsers = usersList.value.filter((user) => user.role === 'admin').length
  const newThisMonth = usersList.value.filter((user) => {
    const created = new Date(user.created)
    const now = new Date()
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  }).length

  return { totalUsers, activeUsers, adminUsers, newThisMonth }
})

const filteredUsers = computed(() => {
  return usersList.value.filter((user) => {
    const matchesSearch =
      !searchQuery.value ||
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesRole = !selectedRole.value || user.role === selectedRole.value
    const matchesStatus = !selectedStatus.value || user.status === selectedStatus.value

    return matchesSearch && matchesRole && matchesStatus
  })
})

// Helper functions
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '-'
  }
}

const getInitials = (name: string): string => {
  if (!name) return 'UU'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const mapRole = (roleId: number, roleName?: string): string => {
  if (roleName) return roleName.toLowerCase()

  const roleMap: { [key: number]: string } = {
    1: 'admin',
    2: 'user',
    3: 'manager',
    4: 'user',
  }
  return roleMap[roleId] || 'user'
}

const mapApiUserToMappedUser = (user: ApiUser): MappedUser => ({
  id: user.user_id,
  name: user.name,
  email: user.email,
  phone: user.contact_number || '-',
  role: mapRole(user.role_id, user.role),
  status: user.status || 'active',
  initials: getInitials(user.name),
  username: user.email.split('@')[0],
  lastActive: formatDate(user.updated_at),
  created: formatDate(user.added_at || user.created_at),
  tokensUsed: user.tokens_used || 0,
  primaryContact: user.primary_contact,
  isActive: (user.status || 'active') === 'active',
})

// API functions
const loadUsers = async () => {
  loading.value = true
  error.value = null

  try {
    await usersStore.fetchUsers()
    if (usersStore.users?.length) {
      usersList.value = usersStore.users.map(mapApiUserToMappedUser)
    }
  } catch (err: any) {
    console.error('Failed to load users:', err)
    error.value = usersStore.getUserError || err.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const saveUser = async () => {
  // Validate phone number (extra step since you're using LibVueTelInput)
  if (!validatePhoneField()) {
    return
  }

  const phoneData = phoneRef.value?.phoneData
  const phoneNumberWithCountryCode = phoneData?.number || userForm.phone || ''

  const payload = {
    name: userForm.name,
    email: userForm.email,
    contact_number: phoneNumberWithCountryCode,
    role: userForm.role,
    primary_contact: userForm.primaryContact || false,
    status: userForm.isActive ? 'active' : 'inactive',
  }
  console.log('payload', payload)
  if (isEditMode.value && userForm.id) {
    updatingUser.value = true
    try {
      await usersStore.editUser(userForm.id, payload)
      await loadUsers()
      showUserModal.value = false
    } catch (err: any) {
      console.error('Error updating user:', err)
      error.value = usersStore.getUserError || 'Failed to update user'
    } finally {
      updatingUser.value = false
    }
  } else {
    addingUser.value = true
    try {
      await usersStore.createUser(payload)
      await loadUsers()
      showUserModal.value = false
      resetUserForm()
    } catch (err: any) {
      console.error('Error creating user:', err)
      error.value = usersStore.getUserError || 'Failed to create user'
    } finally {
      addingUser.value = false
    }
  }
}

// Reset form function
const resetUserForm = () => {
  userForm.id = ''
  userForm.name = ''
  userForm.email = ''
  userForm.phone = ''
  userForm.role = ''
  userForm.primaryContact = false
  userForm.isActive = true

  // Reset phone component
  if (phoneRef.value && phoneRef.value.resetPhoneField) {
    phoneRef.value.resetPhoneField()
  }
  phoneValidation.value = { status: true, message: '' }
}

// Unified modal open functions
const openAddUserModal = () => {
  isEditMode.value = false
  resetUserForm()
  showUserModal.value = true
}

const openEditUserModal = async (user: any) => {
  isEditMode.value = true
  console.log('user in edit modal', user)
  console.log('user.phone', userForm)

  Object.assign(userForm, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    primaryContact: user.primaryContact || false,
    isActive: user.status === 'active',
  })

  // Set phone in LibVueTelInput

  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
}

// Deactivate user
const confirmDelete = async () => {
  if (!selectedUser.value) return
  deletingUser.value = true
  try {
    await usersStore.deleteUser(selectedUser.value.id)
    await loadUsers()
    showDeleteUserModal.value = false
  } catch (err: any) {
    console.error('Error deactivating user:', err)
    error.value = usersStore.getUserError || 'Failed to deactivate user'
  } finally {
    deletingUser.value = false
  }
}

// User actions
const editUser = (user: MappedUser) => {
  openEditUserModal(user)
}

const deleteUser = (user: MappedUser) => {
  selectedUser.value = user
  showDeleteUserModal.value = true
}

//CSV Template

const downloadCsv = async () => {
  try {
    // Directly get the blob from the store method
    const blob = await profileStore.downloadTemplate()

    if (!blob || blob.size === 0) {
      throw new Error('Received empty or invalid Blob.')
    }

    // Ensure the Blob is of type CSV
    if (blob.type !== 'text/csv') {
      throw new Error('Unexpected Blob type: ' + blob.type)
    }

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'users_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)

    showSuccess('CSV template downloaded successfully.')
  } catch (error) {
    showError(`Failed to download CSV template: ${error.message}`)
  }
}

//Upload

import Papa from 'papaparse'
import 'github-markdown-css/github-markdown.css'

const selectedFile = ref(null)
const userPreview = ref([])
const showPreview = ref(false)
const errors = ref([])
const fileInput = ref(null)
const isViewMode = ref(true)
const previewData = ref([])
const showForm2 = ref(false)
const viewContent = ref('')

const REQUIRED_HEADERS = ['name', 'email', 'whatsapp_number']

const openBulkUplaod = () => {
  showForm2.value = true
}

const triggerFileInput = () => {
  fileInput.value?.click() // Trigger file input dialog when clicked
}

const handleFileInput = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  validateFile(file)
}

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files?.[0]
  validateFile(file)
}

const validateFile = (file?: File) => {
  if (!file) {
    showError('No file selected.')
    return
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  const type = file.type.toLowerCase()

  if (!(ext === 'csv' || type.includes('csv'))) {
    showError('Invalid file type. Only CSV is allowed.')
    return
  }

  selectedFile.value = file
  openPreview(file)
}

const openPreview = async (file: File) => {
  // Reset errors array
  errors.value = []
  try {
    const parsedData: any[] = await new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => resolve(result.data),
        error: (err) => reject(err.message),
      })
    })

    // Render the data into a preview and display it
    previewData.value = parsedData
    showPreview.value = true
    showForm2.value = true

    // Call validation API
    const validationResponse = await usersStore.uploadAndValidateJson(parsedData as any)

    // Handle unauthorized access - REMOVED THE RETURN STATEMENT
    if (validationResponse.message === 'Unauthorized') {
      console.log('Unauthorized access detected')
      showError('You are not authorized to perform this action. Please check your permissions.')
      errors.value = [
        {
          errorMessage: 'Unauthorized access. Please contact administrator.',
        },
      ]
      // Keep these to ensure preview shows
      showPreview.value = true
      isViewMode.value = false

      // Render the preview without validation errors (since it's an auth error, not validation errors)
      viewContent.value = renderCSVToHTML(parsedData)
    }
    // Then handle validation errors
    else if (validationResponse.errors && validationResponse.errors.length > 0) {
      console.log('Entering validation error branch')

      errors.value = validationResponse.errors.map(
        (error: { rowNumber: number; invalidFields: any[] }) => ({
          errorMessage: `Row: ${error.rowNumber} - ${error.invalidFields.map((field: { field: any; message: any }) => `${field.field}: ${field.message}`).join(', ')}`,
          rowIndex: error.rowNumber - 1,
          invalidFields: error.invalidFields,
        }),
      )

      // Show toast for each error
      validationResponse.errors.forEach((error: { rowNumber: any; invalidFields: any[] }) => {
        const errorMessage = `Row: ${error.rowNumber} - ${error.invalidFields.map((field: { field: any; message: any }) => `${field.field}: ${field.message}`).join(', ')}`
        showError(errorMessage)
      })

      // Extract error row indices
      const errorRows = validationResponse.errors.map(
        (error: { rowNumber: number }) => error.rowNumber - 1,
      )

      // Map errors by row index for correct table rendering
      const errorMessages = {}
      validationResponse.errors.forEach((error: { rowNumber: number; invalidFields: any[] }) => {
        errorMessages[error.rowNumber - 1] = error.invalidFields.map(
          (field: { field: any; message: any }) => ({
            field: field.field,
            message: field.message,
          }),
        )
      })

      viewContent.value = renderCSVToHTML(parsedData, errorRows, errorMessages)
      showForm2.value = true
      showPreview.value = true
      isViewMode.value = true
    } else {
      console.log('Entering success branch')
      userPreview.value = validationResponse?.data
      isViewMode.value = false
      showForm2.value = true
      viewContent.value = renderCSVToHTML(parsedData)
    }
  } catch (error) {
    console.log('Caught error:', error)
    const errorMsg = error.message || 'An error occurred while validating the file'
    showError('An error occurred while importing the Users: ' + errorMsg)
    errors.value = [
      {
        errorMessage: errorMsg,
      },
    ]
    // Ensure preview shows even on unexpected errors
    showPreview.value = true
    isViewMode.value = false
    // Render basic preview without validation highlights
    viewContent.value = renderCSVToHTML(previewData.value)
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    showError('Please select a file to upload.')
    return
  }
  if (errors.value.length > 0) {
    showError('Please fix the errors before uploading.')
    return
  }
  if (!previewData.value.length) {
    showError('No data to upload.')
    return
  }

  try {
    const response = await usersStore.createBulkUsers(previewData.value as any)
    if (response.status) {
      showSuccess(response.message || 'Users imported successfully!')
      closePreviewForm()
    } else {
      showError(response.message || 'Failed to import data.')
    }
  } catch (err: any) {
    showError(`Unexpected error: ${err.message}`)
  }
}

// Render CSV preview with error highlighting
const renderCSVToHTML = (
  parsedData: any[],
  errorRows: number[] = [],
  errorMessages: Record<number, { field: string; message: string }[]> = {},
) => {
  if (!parsedData.length) return '<p>No data available to display.</p>'
  const headers = Object.keys(parsedData[0])
  let tableHTML = `
    <div style="max-height: calc(100vh - 220px); overflow-y: auto;">
      <table class="table-auto border-collapse border border-gray-300 w-full">
        <thead><tr>`
  headers.forEach((h) => {
    tableHTML += `<th class="border border-gray-300 p-2">${h}</th>`
  })
  tableHTML += `</tr></thead><tbody>`

  parsedData.forEach((row, i) => {
    tableHTML += `<tr>`
    headers.forEach((h) => {
      const errorForField = errorMessages[i]?.find((e) => e.field === h)
      const cellClass = errorForField ? 'bg-red-300 relative group' : ''
      const tooltip = errorForField
        ? `<div class="absolute left-0 top-0 mt-[-4px] ml-[-4px] w-max bg-gray-700 text-white text-xs rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
             ${errorForField.message}
           </div>`
        : ''
      const value = row[h] || '&nbsp;'
      tableHTML += `<td class="border border-gray-300 p-2 ${cellClass}">
          <div class="relative group">${value}${tooltip}</div>
        </td>`
    })
    tableHTML += `</tr>`
  })
  tableHTML += `</tbody></table></div>`
  return tableHTML
}

const closePreviewForm = () => {
  showForm2.value = false
  selectedFile.value = null
  previewData.value = []
  viewContent.value = ''
  errors.value = []
}

// Lifecycle
onMounted(() => {
  loadUsers()
})

useHead({
  title: 'User Management - Admin Dashboard',
})
</script>

<style scoped>
/* Custom styling for vue3-tel-input to match the design */
:deep(.vue-tel-input) {
  border: 1px solid #334155;
  border-radius: 0.5rem;
  background-color: #1e293b;
  transition: all 0.2s ease-in-out;
  box-shadow: none;
  position: relative;
  overflow: visible;
}

:deep(.vue-tel-input:hover) {
  border-color: #475569;
  background-color: #1e293b;
}

:deep(.vue-tel-input:focus-within) {
  border-color: #3b82f6;
  background-color: #1e293b;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

:deep(.vue-tel-input .vti__dropdown) {
  background-color: #1e293b;
  border-right: 1px solid #334155;
  border-radius: 0.5rem 0 0 0.5rem;
}

:deep(.vue-tel-input .vti__dropdown:hover) {
  background-color: #1e293b;
}

:deep(.vue-tel-input .vti__dropdown-list) {
  background-color: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

:deep(.vue-tel-input .vti__dropdown-item) {
  color: #e2e8f0;
  padding: 8px 12px;
}

:deep(.vue-tel-input .vti__dropdown-item:hover) {
  background-color: rgba(59, 130, 246, 0.1);
}

:deep(.vue-tel-input .vti__dropdown-item.highlighted) {
  background-color: rgba(59, 130, 246, 0.2);
}

:deep(.vue-tel-input .vti__selection) {
  color: #e2e8f0;
  font-size: 0.875rem;
}

:deep(.vue-tel-input .vti__input) {
  background-color: transparent !important;
  border: none !important;
  color: #e2e8f0 !important;
  font-size: 0.875rem;
  padding: 0.875rem 1rem !important;
}

:deep(.vue-tel-input .vti__input::placeholder) {
  color: #9ca3af;
}

:deep(.vue-tel-input .vti__input:focus) {
  outline: none !important;
  box-shadow: none !important;
}

:deep(.vue-tel-input .vti__dropdown-arrow) {
  color: #9ca3af;
}

/* Search box styling */
:deep(.vti__search-box) {
  background-color: rgba(31, 41, 55, 0.9) !important;
  border: 1px solid rgba(75, 85, 99, 0.7) !important;
  color: #f3f4f6 !important;
  border-radius: 0.5rem !important;
  margin: 8px !important;
  padding: 8px 12px !important;
  font-size: 14px !important;
  width: calc(100% - 16px) !important;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1) !important;
}

:deep(.vti__search-box::placeholder) {
  color: #9ca3af !important;
}

:deep(.vti__search-box:focus) {
  outline: none !important;
  border-color: #3b82f6 !important;
  background-color: rgba(37, 47, 63, 1) !important;
  box-shadow:
    0 0 0 2px rgba(59, 130, 246, 0.1),
    inset 0 1px 2px rgba(0, 0, 0, 0.1) !important;
}

/* Ensure dropdown list is properly positioned and sized */
:deep(.vue-tel-input .vti__dropdown-list) {
  background-color: rgba(17, 24, 39, 0.95) !important;
  border: 1px solid rgba(55, 65, 81, 0.6) !important;
  border-radius: 0.5rem !important;
  backdrop-filter: blur(10px) !important;
  max-height: 250px !important;
  overflow-y: auto !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
  z-index: 50 !important;
}

select option {
  background-color: #1e293b; /* dark background */
  color: #e2e8f0; /* light text */
  padding: 10px;
}

/* Hover/selected states (for browsers that support it) */
select option:hover,
select option:checked {
  background-color: #3b82f6; /* blue */
  color: white;
}
</style>
