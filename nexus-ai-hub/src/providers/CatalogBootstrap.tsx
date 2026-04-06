'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setModels, setModelsLoading, setModelsError, setLabs, setResearch } from '@/store/modelsSlice';
import { setTemplates, setAgentsLoading, setAgentsError } from '@/store/agentSlice';
import { apiModels, apiLabs, apiAgents, apiResearch } from '@/lib/api';

let catalogHydrationStarted = false;

/** Loads catalog, labs, agent templates, and research once for the whole app (all routes). */
export default function CatalogBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (catalogHydrationStarted) return;
    catalogHydrationStarted = true;

    dispatch(setModelsLoading());
    dispatch(setAgentsLoading());
    Promise.all([apiModels(), apiLabs(), apiAgents(), apiResearch()])
      .then(([models, labs, agents, research]) => {
        dispatch(setModels(models));
        dispatch(setLabs(labs));
        dispatch(setTemplates(agents));
        dispatch(setResearch(research));
      })
      .catch((err) => {
        console.error('Failed to fetch catalog:', err);
        dispatch(setModelsError());
        dispatch(setAgentsError());
      });
  }, [dispatch]);

  return null;
}
