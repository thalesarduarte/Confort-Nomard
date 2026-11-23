import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Skeleton } from '@/design/components';
import { services } from '@/services';
import type { City, CommunityReport, Contribution, ModerationEvent } from '@/services/types';
import { useAppStore } from '@/store/appStore';
import './admin.css';

type LoadState = 'loading' | 'ready' | 'error';
type ProvenanceKey = keyof City['provenance'];
const provenanceGroups: Array<{ key: ProvenanceKey; label: string }> = [
  { key: 'cost', label: 'admin.qualityCost' },
  { key: 'climate', label: 'admin.qualityClimate' },
  { key: 'safety', label: 'admin.qualitySafety' },
];
const kindLabels: Record<Contribution['kind'], string> = {
  dica: 'admin.kindTip',
  comida: 'admin.kindFood',
  bairro: 'admin.kindNeighborhood',
};
const activityLabels: Record<ModerationEvent['action'], string> = {
  submitted: 'ui.eventSubmitted',
  edited: 'ui.eventEdited',
  reported: 'ui.eventReported',
  approved: 'ui.eventApproved',
  changes_requested: 'ui.eventChanges',
  removed: 'ui.eventRemoved',
};

export function AdminPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const adminSession = useAppStore((state) => state.adminSession);
  const [cities, setCities] = useState<City[]>([]);
  const [items, setItems] = useState<Contribution[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [events, setEvents] = useState<ModerationEvent[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const refresh = useCallback(async () => {
    setLoadState('loading');
    try {
      const [cityList, contributions, reportList, activity] = await Promise.all([
        services.cities.list(),
        services.community.list(),
        services.community.reports(),
        services.community.history(),
      ]);
      setCities(cityList);
      setItems(contributions);
      setReports(reportList);
      setEvents(activity);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const cityById = useMemo(() => {
    const index = new Map<string, City>();
    cities.forEach((city) => index.set(city.id, city));
    return index;
  }, [cities]);
  const queue = useMemo(() => items.filter((item) => item.status !== 'aprovado'), [items]);
  const sources = useMemo(() => {
    const allSources = cities.flatMap((city) => provenanceGroups
      .map(({ key }) => city.provenance[key].source.trim())
      .filter(Boolean));
    return [...new Set(allSources)];
  }, [cities]);

  const coverageFor = (key: ProvenanceKey) => {
    const covered = cities.filter((city) => {
      const entry = city.provenance[key];
      return Boolean(entry.source.trim() && entry.updatedAt.trim());
    }).length;
    return cities.length ? Math.round((covered / cities.length) * 100) : 0;
  };

  const decide = async (item: Contribution, decision: 'aprovado' | 'ajustes') => {
    setBusyId(item.id);
    setFeedback('');
    try {
      await services.community.moderate(
        item.id,
        decision,
        t(decision === 'aprovado' ? 'admin.approveNote' : 'admin.changesNote'),
      );
      setFeedback(t('admin.decisionSaved'));
      await refresh();
    } catch {
      setFeedback(t('admin.reviewError'));
    } finally {
      setBusyId(null);
    }
  };

  const signOut = () => {
    services.adminAuth.logout();
    navigate('/admin/login', { replace: true });
  };

  const dateLabel = (value: string) => new Intl.DateTimeFormat(i18n.language, {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(`${value.slice(0, 10)}T12:00:00`));

  return (
    <main id="main-content" className="container page-content admin-page">
      <header className="admin-heading">
        <div>
          <p className="eyebrow"><span className="admin-heading-mark" aria-hidden="true">✳</span>{t('admin.eyebrow')}</p>
          <h1>{t('admin.title')}</h1>
          <p className="admin-subtitle">{t('admin.subtitle')}</p>
        </div>
        <div className="admin-heading-actions">
          <span className="admin-demo-badge"><span aria-hidden="true" className="admin-live-dot" />{t('admin.demoBadge')}</span>
          <span className="admin-session-badge"><span aria-hidden="true">◉</span>{adminSession?.email}</span>
          <Button variant="quiet" onClick={signOut}>{t('admin.logout')}</Button>
          <Button variant="quiet" onClick={() => void refresh()} disabled={loadState === 'loading'}>
            <span aria-hidden="true">↻</span>{t('admin.refresh')}
          </Button>
        </div>
      </header>

      <p className="admin-illustrative-note" role="note">
        <span aria-hidden="true">ⓘ</span>{t('admin.illustrative')}
      </p>

      {loadState === 'loading' && <div className="admin-kpis" aria-live="polite"><Skeleton height={128} /><Skeleton height={128} /><Skeleton height={128} /><Skeleton height={128} /></div>}
      {loadState === 'error' && (
        <Card className="admin-state-card" role="alert">
          <p>{t('admin.refreshError')}</p><Button variant="primary" onClick={() => void refresh()}>{t('admin.refresh')}</Button>
        </Card>
      )}
      {loadState === 'ready' && <>
        <section className="admin-kpis" aria-label={t('admin.sectionOverview')}>
          <Card className="admin-kpi admin-kpi-green"><span className="admin-kpi-icon" aria-hidden="true">⌖</span><span className="admin-kpi-label">{t('admin.cities')}</span><strong>{cities.length}</strong><span className="admin-kpi-caption">{t('admin.citiesCaption')}</span></Card>
          <Card className="admin-kpi admin-kpi-sand"><span className="admin-kpi-icon" aria-hidden="true">▤</span><span className="admin-kpi-label">{t('admin.contributions')}</span><strong>{items.length}</strong><span className="admin-kpi-caption">{t('admin.contributionsCaption')}</span></Card>
          <Card className="admin-kpi admin-kpi-peach"><span className="admin-kpi-icon" aria-hidden="true">◷</span><span className="admin-kpi-label">{t('admin.pending')}</span><strong>{queue.length}</strong><span className="admin-kpi-caption">{t('admin.pendingCaption')}</span></Card>
          <Card className="admin-kpi admin-kpi-lavender"><span className="admin-kpi-icon" aria-hidden="true">⚑</span><span className="admin-kpi-label">{t('admin.reports')}</span><strong>{reports.length}</strong><span className="admin-kpi-caption">{t('admin.reportsCaption')}</span></Card>
        </section>

        {feedback && <p className="admin-feedback" role="status">{feedback}</p>}

        <div className="admin-content-grid">
          <div className="admin-primary-column">
            <Card className="admin-section-card" id="admin-review">
              <div className="admin-section-heading">
                <div><p className="eyebrow">{t('admin.sectionReview')}</p><h2>{t('admin.queueTitle')}</h2></div>
                <span className="admin-count-badge">{queue.length}</span>
              </div>
              <p className="admin-section-description">{t('admin.queueHint')}</p>
              {queue.length === 0 ? <div className="admin-empty"><span aria-hidden="true">✓</span><p>{t('admin.emptyQueue')}</p></div> : (
                <ul className="admin-review-list">
                  {queue.map((item) => {
                    const city = cityById.get(item.cityId);
                    return <li className="admin-review-item" key={item.id}>
                      <div className="admin-review-topline"><span className="admin-kind-tag">{t(kindLabels[item.kind])}</span><time dateTime={item.createdAt}>{dateLabel(item.createdAt)}</time></div>
                      <h3>{item.title}</h3>
                      <p className="admin-review-body">{item.body}</p>
                      <div className="admin-review-meta"><span>{city?.name ?? t('admin.cityUnknown')}{city ? `, ${city.country}` : ''}</span><span>{item.author}</span></div>
                      {item.note && <p className="notice">{item.note}</p>}
                      <div className="admin-review-actions">
                        <Button variant="primary" disabled={busyId === item.id} onClick={() => void decide(item, 'aprovado')}>
                          {busyId === item.id ? t('admin.reviewing') : <><span aria-hidden="true">✓</span>{t('admin.approve')}</>}
                        </Button>
                        <Button variant="quiet" disabled={busyId === item.id} onClick={() => void decide(item, 'ajustes')}>
                          <span aria-hidden="true">↗</span>{t('admin.requestChanges')}
                        </Button>
                      </div>
                    </li>;
                  })}
                </ul>
              )}
            </Card>

            <Card className="admin-section-card" id="admin-activity">
              <div className="admin-section-heading"><div><p className="eyebrow">{t('admin.sectionActivity')}</p><h2>{t('admin.activityTitle')}</h2></div><span className="admin-activity-mark" aria-hidden="true">◌</span></div>
              {events.length === 0 ? <p className="admin-muted-block">{t('admin.activityEmpty')}</p> : <ol className="admin-activity-list">
                {events.slice(0, 5).map((event) => {
                  const item = items.find((entry) => entry.id === event.contributionId);
                  return <li key={event.id}><span className="admin-activity-dot" aria-hidden="true" /><div><strong>{t(activityLabels[event.action])}</strong><span>{item?.title ?? t('admin.cityUnknown')}</span></div><time dateTime={event.createdAt}>{dateLabel(event.createdAt)}</time></li>;
                })}
              </ol>}
            </Card>
          </div>

          <aside className="admin-secondary-column" aria-label={t('admin.sectionQuality')}>
            <Card className="admin-section-card" id="admin-quality">
              <div className="admin-section-heading"><div><p className="eyebrow">{t('admin.sectionQuality')}</p><h2>{t('admin.qualityTitle')}</h2></div><span className="admin-shield" aria-hidden="true">◇</span></div>
              <p className="admin-section-description">{t('admin.qualityHint')}</p>
              <div className="admin-quality-list">
                {provenanceGroups.map(({ key, label }) => {
                  const percent = coverageFor(key);
                  return <div className="admin-quality-row" key={key}>
                    <div className="admin-quality-label"><span>{t(label)}</span><strong>{percent}%</strong></div>
                    <div className="admin-quality-track" role="progressbar" aria-label={t('admin.sourceCoverage', { percent })} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{ width: `${percent}%` }} /></div>
                    <p>{t('admin.sourceCoverage', { percent })}</p>
                  </div>;
                })}
              </div>
              <div className="admin-source-block"><h3>{t('admin.sourceLabel')}</h3>
                {sources.length === 0 ? <p>{t('admin.noSource')}</p> : <ul>{sources.slice(0, 4).map((source) => <li key={source}><span aria-hidden="true">↗</span>{source}</li>)}</ul>}
              </div>
            </Card>

            <Card className="admin-section-card admin-confidence-card">
              <p className="eyebrow">{t('admin.confidenceTitle')}</p>
              <div className="admin-confidence-list">
                {provenanceGroups.map(({ key, label }) => {
                  const confidence = cities.filter((city) => city.provenance[key].confidence === 'alta').length;
                  const percent = cities.length ? Math.round((confidence / cities.length) * 100) : 0;
                  return <div className="admin-confidence-row" key={key}><span>{t(label)}</span><div className="admin-confidence-meter" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div><span className="admin-confidence-value">{confidence} {t('admin.confidenceHigh')}</span></div>;
                })}
              </div>
            </Card>
          </aside>
        </div>
      </>}
    </main>
  );
}
