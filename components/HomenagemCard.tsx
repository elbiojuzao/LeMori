import { Menu } from '@headlessui/react';
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Homenagem {
  _id: string;
  nomeHomenageado: string;
  dataNascimento: string;
  dataCriada: string;
  fotoPerfil?: string;
}

interface HomenagemCardProps {
  homenagem: Homenagem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function HomenagemCard({ homenagem, onEdit, onDelete }: HomenagemCardProps) {
  const dataCriacao = new Date(homenagem.dataCriada);
  const dataExpiracao = new Date(dataCriacao);
  dataExpiracao.setFullYear(dataCriacao.getFullYear() + 5);
  const hoje = new Date();
  const diasRestantes = differenceInDays(dataExpiracao, hoje);
  const passouQuatroAnos = differenceInDays(hoje, new Date(dataCriacao)) > 1460; // 4 anos em dias

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            {homenagem.fotoPerfil ? (
              <img
                src={homenagem.fotoPerfil}
                alt={`Foto de ${homenagem.nomeHomenageado}`}
                className="w-20 h-20 rounded-full object-cover border-4 border-purple-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-2xl text-purple-500">
                  {homenagem.nomeHomenageado.charAt(0)}
                </span>
              </div>
            )}
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {homenagem.nomeHomenageado}
              </h3>
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2 text-purple-500" />
                  <span>
                    Nascido em {format(new Date(homenagem.dataNascimento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2 text-purple-500" />
                  <span>
                    Criado em {format(dataCriacao, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Menu as="div" className="relative">
            <Menu.Button className="p-2 hover:bg-purple-100 rounded-full transition-colors">
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onEdit(homenagem._id)}
                      className={`${
                        active ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                      } flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <PencilIcon className="h-4 w-4 mr-3" />
                      Editar Homenagem
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onDelete(homenagem._id)}
                      className={`${
                        active ? 'bg-red-50 text-red-700' : 'text-red-600'
                      } flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <TrashIcon className="h-4 w-4 mr-3" />
                      Excluir Homenagem
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        </div>

        {passouQuatroAnos && diasRestantes > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-700">
              ⚠️ Esta homenagem irá expirar em {diasRestantes} dias
            </p>
          </div>
        )}

        {passouQuatroAnos && diasRestantes <= 0 && (
          <div className="mt-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ Esta homenagem expirou
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 