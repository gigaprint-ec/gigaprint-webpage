import React from 'react';
import { ArrowUpRight, Code2, MapPin, Share2 } from 'lucide-react';
import { MediaGallery, VideoEmbed } from './MediaGallery';
import { FormRenderer } from './FieldRenderer';

export function BlockRenderer({ blocks = [], className = '', onFormSubmit }) { return <div className={`public-blocks ${className}`}>{blocks.filter((block) => block.visible !== false).map((block) => <SingleBlock key={block.id} block={block} onFormSubmit={onFormSubmit} />)}</div>; }

function SingleBlock({ block, onFormSubmit }) {
  const style = block.animation !== 'none' ? { '--block-animation': block.animation } : undefined;
  if (block.type === 'text') return <section className="public-block block-text" style={style} dangerouslySetInnerHTML={{ __html: block.content || '' }} />;
  if (block.type === 'columns') return <section className="public-block block-columns" style={style}>{block.columns.map((column) => <div key={column.id} style={{ width: `${column.width}%` }}><BlockRenderer blocks={column.blocks} onFormSubmit={onFormSubmit} /></div>)}</section>;
  if (block.type === 'image') return <figure className={`public-block block-image image-${block.size || 'medium'} image-fit-${block.fit || 'cover'}`} style={style}><img src={block.src} alt={block.alt || ''} />{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
  if (block.type === 'gallery') return <section className="public-block"><MediaGallery items={block.items} layout={block.layout} columns={block.columns} /></section>;
  if (block.type === 'media-text') return <section className={`public-block block-media-text side-${block.side}`} style={style}><img src={block.src} alt={block.alt || ''} /><div><div className="eyebrow orange">Gigaprint / detalle</div><h2>{block.title}</h2><div dangerouslySetInnerHTML={{ __html: block.content || '' }} /></div></section>;
  if (block.type === 'banner') return <section className={`public-block block-banner banner-${block.height || 'medium'}`} style={{ ...style, '--banner-overlay': block.overlay ?? .25 }}><img src={block.src} alt={block.alt || ''} /><span /></section>;
  if (block.type === 'video') return <section className="public-block"><VideoEmbed url={block.url} title={block.title} poster={block.poster} /></section>;
  if (block.type === 'divider') return <div className={`public-block block-divider divider-${block.style}`} style={{ '--divider-space': `${block.space || 32}px` }} />;
  if (block.type === 'button') return <div className={`public-block block-button align-${block.align || 'left'}`}><a className={`button button-${block.variant || 'primary'}`} href={block.href}>{block.label}<ArrowUpRight size={16} /></a></div>;
  if (block.type === 'social') return <div className="public-block block-social"><span><Share2 size={16} /> {block.title}</span><div>{block.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}<ArrowUpRight size={13} /></a>)}</div></div>;
  if (block.type === 'map') return <div className="public-block block-map"><div><MapPin size={18} /><span className="eyebrow orange">Dónde estamos</span><h3>{block.title}</h3><p>{block.address}</p></div>{block.embedUrl ? <iframe title={block.title} src={block.embedUrl} loading="lazy" /> : <div className="map-placeholder"><MapPin size={36} /><span>Mapa conectado cuando definamos la ubicación.</span></div>}</div>;
  if (block.type === 'embed') return <div className="public-block block-embed"><div className="embed-label"><Code2 size={14} /> {block.label}</div><div dangerouslySetInnerHTML={{ __html: block.html || '' }} /></div>;
  if (block.type === 'form') return <section className="public-block block-form"><div className="form-heading"><span className="eyebrow orange">Formulario configurable</span><h2>{block.title}</h2></div><FormRenderer fields={block.fields} onSubmit={onFormSubmit} /></section>;
  return null;
}
