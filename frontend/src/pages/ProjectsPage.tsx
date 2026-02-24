import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  FolderKanban,
  Users,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/ui';
import { projectService } from '../services';
import { useToast } from '../contexts/ToastContext';
import type { Project, ProjectRequest } from '../types';

export function ProjectsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectRequest>({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getAll(0, 100);
      setProjects(response.content);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Erro ao carregar projetos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = async () => {
    try {
      setSubmitting(true);
      await projectService.create(formData);
      setIsCreateModalOpen(false);
      setFormData({ name: '', description: '' });
      toast.success('Projeto criado!', 'O projeto foi criado com sucesso.');
      fetchProjects();
    } catch (err) {
      console.error('Error creating project:', err);
      toast.error('Erro ao criar projeto', 'Tente novamente mais tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProject = async () => {
    if (!selectedProject) return;
    try {
      setSubmitting(true);
      await projectService.update(selectedProject.id, formData);
      setIsEditModalOpen(false);
      setSelectedProject(null);
      setFormData({ name: '', description: '' });
      toast.success('Projeto atualizado!', 'As alteracoes foram salvas.');
      fetchProjects();
    } catch (err) {
      console.error('Error updating project:', err);
      toast.error('Erro ao atualizar projeto', 'Tente novamente mais tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    try {
      setSubmitting(true);
      await projectService.delete(selectedProject.id);
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
      toast.success('Projeto excluido!', 'O projeto foi removido.');
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error('Erro ao excluir projeto', 'Tente novamente mais tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setFormData({ name: project.name, description: project.description });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#0288D1' }} />
          <p style={{ color: '#4a6fa5' }}>Carregando projetos...</p>
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
          <button onClick={fetchProjects} className="btn-aero">
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
            Projetos
          </h1>
          <p style={{ color: '#4a6fa5' }}>
            Gerencie seus projetos e equipes
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', description: '' });
            setIsCreateModalOpen(true);
          }}
          className="btn-aero inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Projeto</span>
        </button>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#4a6fa5' }} />
          <input
            type="text"
            placeholder="Buscar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-aero pl-12"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{
                  background: 'linear-gradient(180deg, #4FC3F7 0%, #0288D1 100%)',
                  boxShadow: '0 4px 15px rgba(2, 136, 209, 0.3)',
                }}
              >
                <FolderKanban className="w-6 h-6 text-white" />
              </div>
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-white/50 transition-colors">
                  <MoreVertical className="w-5 h-5" style={{ color: '#4a6fa5' }} />
                </button>
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-1 w-40 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10"
                  style={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  <button 
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/50 text-left" 
                    style={{ color: '#1a365d' }}
                  >
                    <Eye className="w-4 h-4" /> Ver
                  </button>
                  <button 
                    onClick={() => openEditModal(project)}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/50 text-left" 
                    style={{ color: '#1a365d' }}
                  >
                    <Edit className="w-4 h-4" /> Editar
                  </button>
                  <button 
                    onClick={() => openDeleteModal(project)}
                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-red-50 text-left text-red-600"
                  >
                    <Trash2 className="w-4 h-4" /> Excluir
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <h3 
              className="text-lg font-bold mb-2 cursor-pointer hover:underline" 
              style={{ color: '#1a365d' }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              {project.name}
            </h3>
            <p className="text-sm mb-4 line-clamp-2" style={{ color: '#4a6fa5' }}>
              {project.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm" style={{ color: '#4a6fa5' }}>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{(project.members?.length || 0) + 1}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(project.updatedAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {/* Owner badge */}
            <div className="mt-4 pt-4 border-t border-white/30">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    background: 'linear-gradient(180deg, #81C784 0%, #388E3C 100%)',
                  }}
                >
                  {project.owner.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1a365d' }}>
                    {project.owner.name}
                  </p>
                  <p className="text-xs" style={{ color: '#4a6fa5' }}>Owner</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state / Create new */}
        <button
          onClick={() => {
            setFormData({ name: '', description: '' });
            setIsCreateModalOpen(true);
          }}
          className="glass-card p-6 border-2 border-dashed border-white/40 hover:border-aero-400 transition-colors flex flex-col items-center justify-center min-h-[250px] group"
        >
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
            style={{
              background: 'linear-gradient(180deg, rgba(79,195,247,0.2) 0%, rgba(2,136,209,0.2) 100%)',
            }}
          >
            <Plus className="w-8 h-8" style={{ color: '#0288D1' }} />
          </div>
          <p className="font-semibold" style={{ color: '#1a365d' }}>Criar novo projeto</p>
          <p className="text-sm" style={{ color: '#4a6fa5' }}>Clique para adicionar</p>
        </button>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Projeto"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
              Nome do projeto
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Website Redesign"
              className="input-aero"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
              Descricao
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o projeto..."
              className="input-aero min-h-[100px] resize-none"
              rows={4}
            />
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
              Criar Projeto
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Projeto"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleEditProject(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
              Nome do projeto
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Website Redesign"
              className="input-aero"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#2d5a87' }}>
              Descricao
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o projeto..."
              className="input-aero min-h-[100px] resize-none"
              rows={4}
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
        title="Excluir Projeto"
      >
        <div className="space-y-4">
          <p style={{ color: '#4a6fa5' }}>
            Tem certeza que deseja excluir o projeto <strong style={{ color: '#1a365d' }}>{selectedProject?.name}</strong>?
          </p>
          <p className="text-sm text-red-600">
            Esta acao nao pode ser desfeita. Todas as tarefas associadas serao removidas.
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
              onClick={handleDeleteProject}
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
