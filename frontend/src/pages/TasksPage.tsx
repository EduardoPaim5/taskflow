import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search,
  Clock,
  CheckCircle2,
  Circle,
  MoreVertical,
  Calendar,
  User,
  Flag,
  Loader2,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { Modal, Select } from '../components/ui';
import { taskService, projectService } from '../services';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import type { Task, TaskStatus, TaskPriority, Project, TaskRequest } from '../types';

const columns: { id: TaskStatus; label: string; icon: typeof Circle; color: string; gradient: string }[] = [
  { 
    id: 'TODO', 
    label: 'A Fazer', 
    icon: Circle, 
    color: '#4a6fa5',
    gradient: 'linear-gradient(180deg, #90CAF9 0%, #42A5F5 100%)',
  },
  { 
    id: 'DOING', 
    label: 'Em Progresso', 
    icon: Clock, 
    color: '#FF9800',
    gradient: 'linear-gradient(180deg, #FFD54F 0%, #FF9800 100%)',
  },
  { 
    id: 'DONE', 
    label: 'Concluido', 
    icon: CheckCircle2, 
    color: '#4CAF50',
    gradient: 'linear-gradient(180deg, #81C784 0%, #388E3C 100%)',
  },
];

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  LOW: { label: 'Baixa', color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.15)' },
  MEDIUM: { label: 'Media', color: '#FF9800', bg: 'rgba(255, 152, 0, 0.15)' },
  HIGH: { label: 'Alta', color: '#F44336', bg: 'rgba(244, 67, 54, 0.15)' },
};

export function TasksPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<TaskRequest>>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    projectId: undefined,
    deadline: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksResponse, projectsResponse] = await Promise.all([
        taskService.getAll({ size: 100 }),
        projectService.getAll(0, 100),
      ]);
      setTasks(tasksResponse.content);
      setProjects(projectsResponse.content);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erro ao carregar tarefas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = !filterProject || task.project.id.toString() === filterProject;
    return matchesSearch && matchesProject;
  });

  const getTasksByStatus = (status: TaskStatus) => 
    filteredTasks.filter(task => task.status === status);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: TaskStatus) => {
    if (draggedTask && draggedTask.status !== status) {
      const wasCompleted = draggedTask.status === 'DONE';
      const isCompleting = status === 'DONE';
      const hasAssignee = !!draggedTask.assignee;
      
      try {
        // Optimistic update
        setTasks(tasks.map(task => 
          task.id === draggedTask.id 
            ? { ...task, status, completedAt: status === 'DONE' ? new Date().toISOString() : undefined }
            : task
        ));
        await taskService.updateStatus(draggedTask.id, status);
        
        if (isCompleting && hasAssignee) {
          toast.success('Tarefa concluida!', 'Pontos adicionados!');
        } else if (isCompleting && !hasAssignee) {
          toast.success('Tarefa concluida!', 'Atribua um responsavel para ganhar pontos.');
        } else if (wasCompleted && !isCompleting && hasAssignee) {
          toast.warning('Tarefa reaberta', 'Pontos removidos.');
        }
      } catch (err) {
        console.error('Error updating task status:', err);
        // Revert on error
        fetchData();
        toast.error('Erro ao atualizar status', 'Tente novamente.');
      }
    }
    setDraggedTask(null);
  };

  const handleCreateTask = async () => {
    if (!formData.projectId) {
      toast.warning('Selecione um projeto', 'E necessario escolher um projeto.');
      return;
    }
    try {
      setSubmitting(true);
      await taskService.create({
        title: formData.title || '',
        description: formData.description || '',
        priority: formData.priority || 'MEDIUM',
        projectId: formData.projectId,
        assigneeId: formData.assigneeId,
        deadline: formData.deadline || undefined,
      });
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Tarefa criada!', 'A tarefa foi adicionada ao projeto.');
      fetchData();
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('Erro ao criar tarefa', 'Tente novamente mais tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTask = async () => {
    if (!selectedTask) return;
    try {
      setSubmitting(true);
      await taskService.update(selectedTask.id, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        projectId: formData.projectId,
        assigneeId: formData.assigneeId,
        deadline: formData.deadline || undefined,
      });
      setIsEditModalOpen(false);
      setSelectedTask(null);
      resetForm();
      toast.success('Tarefa atualizada!', 'As alteracoes foram salvas.');
      fetchData();
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Erro ao atualizar tarefa', 'Tente novamente mais tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      setSubmitting(true);
      await taskService.delete(selectedTask.id);
      setIsDeleteModalOpen(false);
      setSelectedTask(null);
      toast.success('Tarefa excluida!', 'A tarefa foi removida.');
      fetchData();
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Erro ao excluir tarefa', 'Tente novamente mais tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      projectId: undefined,
      deadline: '',
    });
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      projectId: task.project.id,
      assigneeId: task.assignee?.id,
      deadline: task.deadline || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#0288D1' }} />
          <p style={{ color: '#4a6fa5' }}>Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center glass-card p-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchData} className="btn-aero">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1a365d' }}>
            Tarefas
          </h1>
          <p style={{ color: '#4a6fa5' }}>
            Quadro Kanban - Arraste para mover
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="btn-aero inline-flex items-center gap-2"
          disabled={projects.length === 0}
        >
          <Plus className="w-5 h-5" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {projects.length === 0 && (
        <div className="glass-card p-6 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#FF9800' }} />
          <p style={{ color: '#4a6fa5' }}>
            Crie um projeto primeiro para adicionar tarefas.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4 relative z-20">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#4a6fa5' }} />
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-aero pl-12"
            />
          </div>
          <div className="sm:w-48 relative z-30">
            <Select
              value={filterProject}
              onChange={setFilterProject}
              placeholder="Todos os projetos"
              options={[
                { label: 'Todos os projetos', value: '' },
                ...projects.map(p => ({ label: p.name, value: p.id.toString() })),
              ]}
            />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {columns.map((column) => (
          <div
            key={column.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
            className="glass-card p-4 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/30">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: column.gradient }}
              >
                <column.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold" style={{ color: '#1a365d' }}>
                  {column.label}
                </h3>
                <p className="text-sm" style={{ color: '#4a6fa5' }}>
                  {getTasksByStatus(column.id).length} tarefas
                </p>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {getTasksByStatus(column.id).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className={`
                    p-4 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200
                    hover:scale-[1.02] hover:shadow-lg group
                    ${draggedTask?.id === task.id ? 'opacity-50' : ''}
                  `}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  }}
                >
                  {/* Priority & Menu */}
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"
                      style={{ 
                        background: priorityConfig[task.priority].bg,
                        color: priorityConfig[task.priority].color,
                      }}
                    >
                      <Flag className="w-3 h-3" />
                      {priorityConfig[task.priority].label}
                    </span>
                    <div className="relative">
                      <button className="p-1 rounded hover:bg-white/50 transition-colors">
                        <MoreVertical className="w-4 h-4" style={{ color: '#4a6fa5' }} />
                      </button>
                      {/* Dropdown menu */}
                      <div className="absolute right-0 mt-1 w-32 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10"
                        style={{
                          background: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.6)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        }}
                      >
                        <button 
                          onClick={() => openEditModal(task)}
                          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/50 text-left text-sm" 
                          style={{ color: '#1a365d' }}
                        >
                          <Edit className="w-3 h-3" /> Editar
                        </button>
                        <button 
                          onClick={() => openDeleteModal(task)}
                          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-50 text-left text-sm text-red-600"
                        >
                          <Trash2 className="w-3 h-3" /> Excluir
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="font-semibold mb-1" style={{ color: '#1a365d' }}>
                    {task.title}
                  </h4>
                  <p className="text-sm mb-3 line-clamp-2" style={{ color: '#4a6fa5' }}>
                    {task.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs" style={{ color: '#4a6fa5' }}>
                    <div className="flex items-center gap-3">
                      {task.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(task.deadline).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                    {task.assignee ? (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: 'linear-gradient(180deg, #81C784 0%, #388E3C 100%)' }}
                        title={task.assignee.name}
                      >
                        {task.assignee.name.charAt(0)}
                      </div>
                    ) : (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-dashed"
                        style={{ borderColor: '#4a6fa5' }}
                        title="Sem responsavel"
                      >
                        <User className="w-3 h-3" style={{ color: '#4a6fa5' }} />
                      </div>
                    )}
                  </div>

                  {/* Project badge */}
                  <div className="mt-3 pt-3 border-t border-white/30">
                    <span 
                      className="text-xs px-2 py-1 rounded-lg"
                      style={{ 
                        background: 'rgba(2, 136, 209, 0.1)',
                        color: '#0288D1',
                      }}
                    >
                      {task.project.name}
                    </span>
                  </div>
                </div>
              ))}

              {getTasksByStatus(column.id).length === 0 && (
                <div 
                  className="p-8 rounded-xl border-2 border-dashed text-center"
                  style={{ borderColor: 'rgba(74, 111, 165, 0.3)' }}
                >
                  <p className="text-sm" style={{ color: '#4a6fa5' }}>
                    Nenhuma tarefa
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nova Tarefa"
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateTask(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
              Titulo
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Implementar login"
              className="input-aero"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
              Descricao
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva a tarefa..."
              className="input-aero min-h-[100px] resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
                Prioridade
              </label>
              <Select
                value={formData.priority || 'MEDIUM'}
                onChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
                options={[
                  { label: 'Baixa', value: 'LOW' },
                  { label: 'Media', value: 'MEDIUM' },
                  { label: 'Alta', value: 'HIGH' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
                Projeto *
              </label>
              <Select
                value={formData.projectId?.toString() || ''}
                onChange={(value) => setFormData({ ...formData, projectId: parseInt(value) })}
                placeholder="Selecione..."
                options={projects.map(p => ({ label: p.name, value: p.id.toString() }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
                Responsavel
              </label>
              <Select
                value={formData.assigneeId?.toString() || ''}
                onChange={(value) => setFormData({ ...formData, assigneeId: value ? parseInt(value) : undefined })}
                placeholder="Sem responsavel"
                options={[
                  { label: 'Sem responsavel', value: '' },
                  { label: user?.name || 'Eu', value: user?.id?.toString() || '' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
                Prazo (opcional)
              </label>
              <input
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="input-aero"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors hover:bg-gray-100"
              style={{ color: '#4a6fa5' }}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 btn-aero inline-flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar Tarefa
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Tarefa"
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleEditTask(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
              Titulo
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Implementar login"
              className="input-aero"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
              Descricao
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva a tarefa..."
              className="input-aero min-h-[100px] resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
                Prioridade
              </label>
              <Select
                value={formData.priority || 'MEDIUM'}
                onChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
                options={[
                  { label: 'Baixa', value: 'LOW' },
                  { label: 'Media', value: 'MEDIUM' },
                  { label: 'Alta', value: 'HIGH' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
                Responsavel
              </label>
              <Select
                value={formData.assigneeId?.toString() || ''}
                onChange={(value) => setFormData({ ...formData, assigneeId: value ? parseInt(value) : undefined })}
                placeholder="Sem responsavel"
                options={[
                  { label: 'Sem responsavel', value: '' },
                  { label: user?.name || 'Eu', value: user?.id?.toString() || '' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
              Prazo (opcional)
            </label>
            <input
              type="date"
              value={formData.deadline || ''}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="input-aero"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors hover:bg-gray-100"
              style={{ color: '#4a6fa5' }}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 btn-aero inline-flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Tarefa"
      >
        <div className="space-y-4">
          <p style={{ color: '#4a6fa5' }}>
            Tem certeza que deseja excluir a tarefa <strong style={{ color: '#1a365d' }}>{selectedTask?.title}</strong>?
          </p>
          <p className="text-sm text-red-600">
            Esta acao nao pode ser desfeita.
          </p>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors hover:bg-gray-100"
              style={{ color: '#4a6fa5' }}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button 
              onClick={handleDeleteTask}
              className="flex-1 px-4 py-3 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white transition-colors inline-flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
